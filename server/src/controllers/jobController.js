import Job from '../models/Job.js';

const mockJobs = [
    {
        company: "TechFlow Labs",
        role: "Frontend Engineering Intern",
        type: "Internship",
        location: "Remote (Global)",
        salary: "$2,000 - $3,500 / month",
        reqs: ["React", "Tailwind CSS", "JavaScript ES6+"],
        isHot: true
    },
    {
        company: "DataSphere Inc.",
        role: "Junior Data Analyst",
        type: "Full-time",
        location: "New York, NY (Hybrid)",
        salary: "$65,000 - $80,000 / year",
        reqs: ["Python", "SQL", "Tableau/PowerBI"],
        isHot: false
    },
    {
        company: "CloudNative",
        role: "Backend Developer",
        type: "Full-time",
        location: "London, UK",
        salary: "£45,000 - £60,000 / year",
        reqs: ["Node.js", "Express", "MongoDB", "AWS"],
        isHot: true
    },
    {
        company: "StartupZ",
        role: "UI/UX Design Intern",
        type: "Internship",
        location: "San Francisco, CA (On-site)",
        salary: "$30 / hour",
        reqs: ["Figma", "User Research", "Prototyping"],
        isHot: false
    }
];

export const getJobs = async (req, res) => {
    try {
        let jobs = await Job.find().sort({ createdAt: -1 });

        // Auto-seed for DEMO purposes if the DB is empty
        if (jobs.length === 0) {
            console.log("Auto-seeding initial jobs for demo testing...");
            await Job.insertMany(mockJobs);
            jobs = await Job.find().sort({ createdAt: -1 });
        }

        let userSkills = [];
        if (req.user && req.user.learningInterests) {
            userSkills = req.user.learningInterests.map(i => i.toLowerCase());
        }

        // Calculate Match Score for each job
        const recommendedJobs = jobs.map(job => {
            let matchCount = 0;
            const jobReqs = job.reqs.map(r => r.toLowerCase());
            
            // Very simple overlapping algorithm
            jobReqs.forEach(req => {
                if (userSkills.some(skill => skill.includes(req) || req.includes(skill))) {
                    matchCount++;
                }
            });

            const matchPercentage = jobReqs.length > 0 ? Math.round((matchCount / jobReqs.length) * 100) : 0;
            
            return {
                ...job.toObject(),
                matchPercentage
            };
        });

        // Sort by highest match percentage first
        recommendedJobs.sort((a, b) => b.matchPercentage - a.matchPercentage);

        res.json(recommendedJobs);
    } catch (error) {
        console.error("Fetch Jobs Error:", error);
        res.status(500).json({ message: error.message });
    }
};
