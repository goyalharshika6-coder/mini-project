import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import Course from '../models/Course.js';
import User from '../models/User.js';
import axios from 'axios';

const client = new BedrockRuntimeClient({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const parseAIResponse = (text) => {
    try {
        console.log("Parsing AI response...");
        // Strip markdown code blocks if present
        const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
        const jsonString = jsonMatch ? jsonMatch[1].trim() : text.trim();

        const firstBracket = jsonString.search(/[\[\{]/);
        const lastBracket = Math.max(jsonString.lastIndexOf(']'), jsonString.lastIndexOf('}'));

        if (firstBracket === -1 || lastBracket === -1 || lastBracket < firstBracket) {
            console.error("No valid JSON brackets found in text:", text);
            throw new Error("Invalid AI response format");
        }

        const cleanedJson = jsonString.substring(firstBracket, lastBracket + 1);
        return JSON.parse(cleanedJson);
    } catch (error) {
        console.error("Parse Error:", error, "Original Text:", text);
        throw new Error("Failed to parse AI response: " + error.message);
    }
};

const callBedrock = async (prompt) => {
    const modelId = "meta.llama3-8b-instruct-v1:0";

    // Llama 3.2 prompt format
    const formattedPrompt = `<|begin_of_text|><|start_header_id|>user<|end_header_id|>\n\n${prompt}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n`;

    const body = JSON.stringify({
        prompt: formattedPrompt,
        max_gen_len: 2048,
        temperature: 0.5,
        top_p: 0.9,
    });

    const command = new InvokeModelCommand({
        modelId,
        body,
        contentType: "application/json",
        accept: "application/json",
    });

    try {
        const response = await client.send(command);
        const result = JSON.parse(new TextDecoder().decode(response.body));
        // Llama 3 on Bedrock returns the result in the 'generation' field
        return parseAIResponse(result.generation);
    } catch (error) {
        console.error("Bedrock Error:", error);
        throw error;
    }
};

// Step 3: Generate Diagnostic Test
export const generateDiagnosticTest = async (req, res) => {
    const { courseName, targetGoal, duration, dailyTime } = req.body;

    try {
        const prompt = `You are a specialized technical instructor for the topic: "${courseName}".
        Generate a unique, challenging diagnostic test strictly for "${courseName}" based on the goal: "${targetGoal}".
        DO NOT include questions about unrelated technologies (e.g., if the topic is Python, do not ask about React).
        
        The assessment must contain exactly 5 technical questions:
        - 3 Multiple Choice Questions (MCQ) with 4 plausible options.
        - 2 Technical Short Answer questions (set options to an empty array).
        Ensure the questions are specific to the core concepts and advanced features of ${courseName}.
        
        Return ONLY a JSON array of objects.
        Format: [{"question": "...", "options": ["...", "..."], "answer": "...", "difficulty": "...", "skill": "..."}]`;

        const diagnosticTest = await callBedrock(prompt);

        const course = await Course.create({
            userId: req.user._id,
            courseName,
            targetGoal,
            duration,
            dailyTime,
            diagnosticTest
        });

        res.status(201).json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Step 4: Analyze Skill Gap
export const analyzeSkillGap = async (req, res) => {
    const { testResults } = req.body;
    const courseId = req.params.id;

    try {
        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        const prompt = `Analyze these test results for the course "${course.courseName}": ${JSON.stringify(testResults)}. 
        Some results are MCQ selections, while others are technical short-answer explanations.
        Based on the accuracy and technical depth of the answers, determine:
        1. Current skill level (Beginner, Intermediate, Advanced).
        2. A list of 4-6 specifically missing skills or areas for improvement.
        3. A list of 3-4 already known skills based on correct answers.
        4. Calculation of a diagnostic score (0-100) reflecting technical proficiency.
        Return ONLY a JSON object with fields: score, skillLevel, missingSkills, knownSkills.`;

        console.log("Analyzing Skill Gap with prompt...");
        const aiResults = await callBedrock(prompt);
        console.log("AI Analysis Analysis Results:", aiResults);
        course.diagnosticResults = aiResults;

        await course.save();
        res.json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Step 5 & 6: Generate Personalized Course Structure & Time Optimization
export const generateCourseStructure = async (req, res) => {
    const courseId = req.params.id;

    try {
        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        console.log(`Generating structure for course: ${courseId} (User: ${course.userId})`);

        // Extract diagnostic info safely
        const { skillLevel = 'Beginner', missingSkills = [] } = course.diagnosticResults || {};
        console.log(`Current Skill Level: ${skillLevel}`);
        console.log(`Missing Skills Identified: ${Array.isArray(missingSkills) ? missingSkills.join(', ') : 'None'}`);

        const prompt = `Generate a structured, rigorous, multi-stage learning roadmap for "${course.courseName}" targeting "${course.targetGoal}" in ${course.duration} days.
        Current Level: ${skillLevel}. Missing Skills: ${Array.isArray(missingSkills) ? missingSkills.join(', ') : 'None'}.
        Optimize for ${course.dailyTime} hours/day. 
        Total study hours available: ${course.duration * course.dailyTime}.
        
        CRITICAL INSTRUCTION: You MUST divide the roadmap into EXACTLY 4 overarching stages (e.g., "Stage 1: Fundamentals", "Stage 2: Core Concepts", "Stage 3: Advanced Architectures", "Stage 4: Real-World Applications").
        For EACH stage, you MUST generate EXACTLY 5 distinct modules (topics) that logically progress the user.
        This means your final output MUST be an array containing EXACTLY 20 module objects in total (4 stages × 5 modules each).
        
        Return ONLY a JSON array where each object has EXACTLY the following format: 
        {
          "stage": "Name of the overarching stage/level",
          "chapter": "e.g. Chapter 1: Title",
          "topic": "Main topic covered (Specific module topic)",
          "subtopics": ["Subtopic 1", "Subtopic 2", "Subtopic 3"],
          "description": "Short summary of what will be learned in this specific topic",
          "estimatedTime": "e.g. 8 hours",
          "status": "pending"
        }`;

        console.log("Sending prompt to Bedrock for structure generation...");
        const aiResponse = await callBedrock(prompt);
        console.log("Structure AI Response received and parsed.");

        course.structure = aiResponse;
        console.log("Structure saved to course object. Module count:", course.structure?.length);
        console.log("Structure generated successfully. Module count:", course.structure?.length);
        await course.save();
        res.json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Step 7: Course Enrollment
export const enrollInCourse = async (req, res) => {
    const courseId = req.params.id;

    try {
        console.log(`Enrollment starting: User ${req.user._id} attempting to enroll in Course ${courseId}`);
        const course = await Course.findById(courseId);
        if (!course) {
            console.error(`Course not found: ${courseId}`);
            return res.status(404).json({ message: 'Course not found' });
        }

        course.isEnrolled = true;
        // Ensure userId matches if we want strict ownership, but for now just enroll
        if (!course.userId) {
            course.userId = req.user._id;
        }
        await course.save();

        console.log(`Enrollment successful for Course ID: ${courseId}. Updating user: ${req.user._id}`);

        // Update user's enrolledCourses
        const updatedUser = await User.findByIdAndUpdate(req.user._id, {
            $addToSet: { enrolledCourses: { courseId: course._id, progress: 0 } }
        }, { new: true });

        console.log(`User ${req.user._id} enrolledCourses count: ${updatedUser?.enrolledCourses?.length}`);

        console.log(`User ${req.user._id} enrolled in course ${courseId}`);

        res.json({ message: 'Enrolled successfully', course });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const dropCourse = async (req, res) => {
    const courseId = req.params.id;

    try {
        console.log(`User ${req.user._id} attempting to drop Course ${courseId}`);
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Only allow the owner to drop it
        if (course.userId && course.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized to drop this course' });
        }

        // Delete the course document itself
        await Course.findByIdAndDelete(courseId);

        // Pull it from the user's enrolled array
        await User.findByIdAndUpdate(req.user._id, {
            $pull: { enrolledCourses: { courseId: courseId } }
        });

        console.log(`Successfully dropped and deleted Course ${courseId}`);
        res.json({ message: 'Course dropped successfully' });
    } catch (error) {
        console.error("Drop Course Error:", error);
        res.status(500).json({ message: error.message });
    }
};

export const updateModuleStatus = async (req, res) => {
    const { courseId, moduleIndex, status } = req.body; // status: pending, in-progress, completed

    try {
        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        if (course.structure[moduleIndex]) {
            course.structure[moduleIndex].status = status;

            // Add XP if completed
            if (status === 'completed') {
                const user = await User.findById(req.user._id);
                user.xp += 50; // default 50 XP per module

                // --- BADGE LOGIC ---
                // Check if all modules are now completed
                const allCompleted = course.structure.every(m => m.status === 'completed');

                // Check if we already have this course badge to avoid duplicates
                const hasBadge = user.badges && user.badges.some(b => b.courseId.toString() === course._id.toString());

                if (allCompleted && !hasBadge) {
                    console.log(`Course ${course.courseName} completed! Granting badge to user ${user._id}`);
                    if (!user.badges) user.badges = [];
                    user.badges.push({
                        name: `Master of ${course.courseName}`,
                        icon: 'Award', // generic icon name for the frontend
                        courseId: course._id
                    });
                }
                // --- END BADGE LOGIC ---

                await user.save();
            }

            await course.save();
            res.json(course);
        } else {
            res.status(400).json({ message: 'Invalid module index' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const generateModuleContent = async (req, res) => {
    const { courseId, moduleIndex } = req.params;

    try {
        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        const module = course.structure[moduleIndex];
        if (!module) return res.status(404).json({ message: 'Module not found' });

        // Check cache
        if (module.content && module.content.markdown) {
            return res.json({ markdown: module.content.markdown });
        }

        const prompt = `You are an expert technical instructor teaching "${course.courseName}".
        Write a comprehensive, engaging, and highly detailed lesson for the topic: "${module.topic}".
        The description of this module is: "${module.description}".
        
        Using Markdown formatting exclusively, provide:
        - A clear introduction explaining the concept.
        - Detailed step-by-step explanations or theoretical deep-dives.
        - Practical real-world examples (with code blocks if applicable to the topic).
        - Textual visuals like Markdown tables, mermaid.js diagrams, or ascii representations to aid understanding where possible.
        - A summary or key takeaways section at the end.
        
        Do NOT wrap the entire response in a JSON object. Return raw Markdown text.`;

        console.log(`Generating detailed content for ${course.courseName} -> ${module.topic}`);
        
        // Custom wrapper for bedrock since the existing one expects JSON parsing
        const formattedPrompt = `<|begin_of_text|><|start_header_id|>user<|end_header_id|>\n\n${prompt}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n`;
        
        const command = new InvokeModelCommand({
            modelId: "meta.llama3-8b-instruct-v1:0",
            body: JSON.stringify({
                prompt: formattedPrompt,
                max_gen_len: 2048,
                temperature: 0.5,
                top_p: 0.9,
            }),
            contentType: "application/json",
            accept: "application/json",
        });

        const response = await client.send(command);
        const result = JSON.parse(new TextDecoder().decode(response.body));
        const markdown = result.generation.trim();

        // Save text to cache
        if (!module.content) module.content = {};
        module.content.markdown = markdown;

        // Fetch YouTube ID for this specific topic using the Official YouTube Data API v3
        // If they already have an ID for this module from earlier, we don't refetch
        if (!module.content.youtubeId && process.env.YOUTUBE_API_KEY) {
            try {
                console.log(`Searching Official YouTube API for Topic: ${module.topic}`);
                const youtubeRes = await axios.get('https://www.googleapis.com/youtube/v3/search', {
                    params: {
                        part: 'snippet',
                        q: `${module.topic} tutorial english`,
                        key: process.env.YOUTUBE_API_KEY,
                        type: 'video',
                        maxResults: 1
                    }
                });
                
                if (youtubeRes.data.items && youtubeRes.data.items.length > 0) {
                    module.content.youtubeId = youtubeRes.data.items[0].id.videoId;
                    console.log(`Found YouTube ID: ${module.content.youtubeId}`);
                }
            } catch (ytError) {
                console.error("YouTube API Search Error:", ytError.response?.data || ytError.message);
            }
        }

        // Auto transition status from pending to in-progress if they are just reading it for the first time
        if (module.status === 'pending') {
            module.status = 'in-progress';
        }

        await course.save();
        res.json({ markdown: module.content.markdown, youtubeId: module.content.youtubeId });

    } catch (error) {
        console.error("Module Generation Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// Phase 6: Generate Chapter Excellence Quiz
export const generateChapterQuiz = async (req, res) => {
    const { courseId, stageName } = req.params;

    try {
        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        // Find all modules that belong to this stage to extract their subtopics
        const stageModules = course.structure.filter(m => m.stage === stageName);
        if (!stageModules.length) return res.status(404).json({ message: 'Stage not found in this course' });

        // Compile a list of what they learned
        const topics = stageModules.map(m => m.topic).join(', ');
        
        // Ensure prompt emphasizes strict JSON structure
        const prompt = `You are a strict technical examiner. The student just finished the chapter/stage: "${stageName}" in the course: "${course.courseName}".
        The topics they learned include: ${topics}.
        
        Generate a rigorous 5-question Multiple Choice Quiz (MCQ) testing them strictly on these topics.
        
        Return ONLY a raw JSON array of 5 objects. Do NOT include ANY text outside the JSON array.
        Format EXACTLY like this:
        [
          {
            "question": "...",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "answer": "Exact string of correct option",
            "explanation": "Short reasoning why this is correct"
          }
        ]`;

        console.log(`Generating Chapter Quiz for course ${courseId}, stage: ${stageName}`);
        
        const quizQuestions = await callBedrock(prompt);

        // check if quiz already exists for stage to avoid duplicates
        const existingQuizIndex = course.chapterQuizzes.findIndex(q => q.stage === stageName);
        if (existingQuizIndex >= 0) {
            // override it
            course.chapterQuizzes[existingQuizIndex].questions = quizQuestions;
        } else {
            // create new
            course.chapterQuizzes.push({
                stage: stageName,
                score: 0,
                completed: false,
                questions: quizQuestions
            });
        }

        await course.save();
        res.json({ questions: quizQuestions });

    } catch (error) {
        console.error("Quiz Generation Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// Phase 7: Save Quiz Score
export const submitChapterQuiz = async (req, res) => {
    const { courseId, stageName, score } = req.body;

    try {
        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        const quizIndex = course.chapterQuizzes.findIndex(q => q.stage === stageName);
        if (quizIndex >= 0) {
            course.chapterQuizzes[quizIndex].score = score;
            course.chapterQuizzes[quizIndex].completed = true;
        } else {
            // Edge case fallback
            course.chapterQuizzes.push({
                stage: stageName,
                score: score,
                completed: true
            });
        }
        
        await course.save();
        res.json(course);

    } catch (error) {
        console.error("Quiz Submission Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// Phase 8: Get Chapter Video (Youtube API)
export const getChapterVideo = async (req, res) => {
    const { courseId, stageName } = req.params;

    try {
        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        // Check if the video is already found for this chapter
        let quizIndex = course.chapterQuizzes.findIndex(q => q.stage === stageName);
        
        // If the array item doesn't exist yet, we initialize it
        if (quizIndex === -1) {
            course.chapterQuizzes.push({ stage: stageName });
            quizIndex = course.chapterQuizzes.length - 1;
        }

        if (course.chapterQuizzes[quizIndex].youtubeId) {
            return res.json({ youtubeId: course.chapterQuizzes[quizIndex].youtubeId });
        }

        // If not found, hit the official YouTube API
        if (process.env.YOUTUBE_API_KEY) {
            console.log(`Searching Official YouTube API for Chapter: ${course.targetGoal} - ${stageName}`);
            const youtubeRes = await axios.get('https://www.googleapis.com/youtube/v3/search', {
                params: {
                    part: 'snippet',
                    q: `${course.targetGoal} ${stageName} full course tutorial english`,
                    key: process.env.YOUTUBE_API_KEY,
                    type: 'video',
                    maxResults: 1,
                    videoDuration: 'long' // Prefer longer masterclass videos for chapter-level
                }
            });
            
            if (youtubeRes.data.items && youtubeRes.data.items.length > 0) {
                const newId = youtubeRes.data.items[0].id.videoId;
                course.chapterQuizzes[quizIndex].youtubeId = newId;
                await course.save();
                return res.json({ youtubeId: newId });
            }
        }
        res.json({ youtubeId: null });
        
    } catch (error) {
        console.error("Chapter Video API Error:", error.response?.data || error.message);
        res.status(500).json({ message: error.message });
    }
};
