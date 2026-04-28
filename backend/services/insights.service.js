const Task = require("../models/Task");
const Interview = require("../models/Interview");

const generateInsights = async (userId) => {
  const tasks = await Task.find({ userId });
  const interviews = await Interview.find({ userId }).sort({ createdAt: -1 });

  const insights = [];
  const suggestions = [];

  // task analysis
  const total = tasks.length;
  const completed = tasks.filter(t => t.done).length;
  const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);

  // category analysis — only show if category has 3+ tasks AND 0% done
  // prevents showing "behind in cat1, cat2" test categories
  const categories = [...new Set(tasks.map(t => t.category))];

  // find weakest categories (max 2 to avoid clutter)
  const weakCats = [];
  for (const cat of categories) {
    const catTasks = tasks.filter(t => t.category === cat);
    const catDone = catTasks.filter(t => t.done).length;
    const catRate = Math.round((catDone / catTasks.length) * 100);

    // only flag if meaningful: 3+ tasks and less than 30% done
    if (catTasks.length >= 3 && catRate < 30) {
      weakCats.push({ cat, catRate, count: catTasks.length });
    } else if (catRate === 100 && catTasks.length >= 2) {
      insights.push(`✅ ${cat} complete!`);
    }
  }

  // show max 2 weak categories
  weakCats.slice(0, 2).forEach(({ cat, catRate }) => {
    insights.push(`⚠️ Behind in ${cat} (${catRate}% done)`);
    suggestions.push(`Focus on ${cat} tasks today`);
  });

  // overdue tasks
  const overdue = tasks.filter(t =>
    !t.done && t.dueDate && new Date(t.dueDate) < new Date()
  );
  if (overdue.length > 0) {
    insights.push(`🔴 ${overdue.length} overdue task${overdue.length > 1 ? "s" : ""}`);
    if (suggestions.length < 3) suggestions.push("Complete overdue tasks first");
  }

  // interview analysis
  const lastInterview = interviews[0];
  if (!lastInterview) {
    insights.push("🎯 No mock interviews done yet");
    if (suggestions.length < 3) suggestions.push("Start a mock interview today");
  } else {
    const avg = lastInterview.averageScore;
    if (avg < 5) {
      insights.push(`📉 Last interview: ${avg}/10 — needs improvement`);
      if (suggestions.length < 3) suggestions.push("Practice more interview questions");
    } else if (avg >= 7) {
      insights.push(`🌟 Last interview: ${avg}/10 — great job!`);
    } else {
      insights.push(`📊 Last interview: ${avg}/10 — getting there`);
    }
  }

  // streak
  const dates = tasks
    .filter(t => t.done)
    .map(t => new Date(t.updatedAt).toDateString());
  const uniqueDates = [...new Set(dates)];
  let streak = 0;
  let current = new Date();
  for (let i = 0; i < 30; i++) {
    if (uniqueDates.includes(current.toDateString())) {
      streak++;
      current.setDate(current.getDate() - 1);
    } else break;
  }

  const todayStr = new Date().toDateString();
  const completedToday = tasks.filter(t =>
    t.done && new Date(t.updatedAt).toDateString() === todayStr
  ).length;

  if (streak === 0 && completedToday === 0) {
    insights.push("💤 No activity today");
    if (suggestions.length < 3) suggestions.push("Complete at least one task to start your streak");
  } else if (streak > 0) {
    insights.push(`🔥 ${streak} day streak — keep going!`);
  }

  // readiness score
  let readiness = 0;
  if (completionRate > 50) readiness += 30;
  if (lastInterview?.averageScore >= 6) readiness += 40;
  if (streak > 2) readiness += 30;

  const readinessLabel =
    readiness >= 70 ? "High 🟢" :
    readiness >= 40 ? "Medium 🟡" : "Low 🔴";

  return {
    // limit insights to 5 max, suggestions to 3 max
    insights: insights.slice(0, 5),
    suggestions: suggestions.slice(0, 3),
    stats: {
      completionRate,
      streak,
      totalTasks: total,
      completedTasks: completed,
      lastInterviewScore: lastInterview?.averageScore || null,
      readiness: readinessLabel,
      readinessScore: readiness
    }
  };
};

module.exports = { generateInsights };