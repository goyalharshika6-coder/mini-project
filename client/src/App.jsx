import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import NewCourse from './pages/NewCourse';
import DiagnosticTest from './pages/DiagnosticTest';
import SkillGapAnalysis from './pages/SkillGapAnalysis';
import CourseGeneration from './pages/CourseGeneration';
import Dashboard from './pages/Dashboard';
import Landing from './pages/Landing';
import Profile from './pages/Profile';
import CourseView from './pages/CourseView';
import ModuleView from './pages/ModuleView';
import Community from './pages/Community';
import Jobs from './pages/Jobs';
import QuizView from './pages/QuizView';
import EnrolledCourses from './pages/EnrolledCourses';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/new-course" element={<NewCourse />} />
        <Route path="/test/:courseId" element={<DiagnosticTest />} />
        <Route path="/skill-gap/:courseId" element={<SkillGapAnalysis />} />
        <Route path="/generate-course/:courseId" element={<CourseGeneration />} />
        <Route path="/course/:courseId" element={<CourseView />} />
        <Route path="/course/:courseId/module/:moduleIndex" element={<ModuleView />} />
        <Route path="/course/:courseId/quiz/:stageName" element={<QuizView />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/enrolled-courses" element={<EnrolledCourses />} />
        <Route path="/community" element={<Community />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
