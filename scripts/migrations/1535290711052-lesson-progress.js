const { addLessonProgress } = require('../../services/lessonService');

exports.func = async function migrate(models) {
  const Course = models.getModel('course');
  const User = models.getModel('user');
  const Lesson = models.getModel('lesson');

  const automation = await Course.findOne({ title: 'Automation with Python' });
  const angular = await Course.findOne({ title: 'Applications with Angular 7' });
  const typescript = await Course.findOne({ title: 'Learning Typescript' });
  const algorithms = await Course.findOne({ title: 'Learning Important Algorithms' });
  const reactjs = await Course.findOne({ title: 'Basics of React js' });
  const filmStudy = await Course.findOne({ title: 'Film Study' });
  const cleanCode = await Course.findOne({ title: 'Write Clean Code' });
  const design = await Course.findOne({ title: 'Principles of Design' });

  const jon = await User.findOne({ email: 'jon@thewall.com' });
  const danaerys = await User.findOne({ email: 'dany@dragonstone.com' });
  const cersei = await User.findOne({ email: 'cersei@casterlyrock.com' });
  const albus = await User.findOne({ email: 'albus@hogwarts.com' });
  const severus = await User.findOne({ email: 'severus@hogwarts.com' });

  const singlePageApps = await Lesson.findOne({ title: 'Single Page Applications' });
  const javascript = await Lesson.findOne({ title: 'Javascript vs. Typescript' });
  const whatIsAnAlgorithm = await Lesson.findOne({ title: 'What is an algorithm?' });
  const isAutomationNecessary = await Lesson.findOne({ title: 'Is automation necessary?' });
  const reactIsALibrary = await Lesson.findOne({ title: 'React js is a Javascript library' });
  const filmHistory = await Lesson.findOne({ title: 'History of Film' });
  const teamWork = await Lesson.findOne({ title: 'Working in a Team' });
  const colour = await Lesson.findOne({ title: 'Examples of Bad Use of Colour' });

  await addLessonProgress({
    lessonId: javascript.id,
    courseId: typescript.id,
    progress: 0.5779727255341245,
    user: albus.id,
    date: 'Mon Sep 02 2019',
  });

  await addLessonProgress({
    lessonId: whatIsAnAlgorithm.id,
    courseId: algorithms.id,
    progress: 0.9982460753326907,
    user: albus.id,
    date: 'Mon Sep 02 2019',
  });

  await addLessonProgress({
    lessonId: reactIsALibrary.id,
    courseId: reactjs.id,
    progress: 0.988320163073109,
    user: severus.id,
    date: 'Mon Sep 02 2019',
  });

  await addLessonProgress({
    lessonId: singlePageApps.id,
    courseId: angular.id,
    progress: 0.9973166334162724,
    user: severus.id,
    date: 'Tue Sep 03 2019',
  });

  await addLessonProgress({
    lessonId: teamWork.id,
    courseId: cleanCode.id,
    progress: 0.8350190386526491,
    user: cersei.id,
    date: 'Tue Sep 03 2019',
  });

  await addLessonProgress({
    lessonId: isAutomationNecessary.id,
    courseId: automation.id,
    progress: 0.9926017773728713,
    user: cersei.id,
    date: 'Tue Sep 03 2019',
  });

  await addLessonProgress({
    lessonId: whatIsAnAlgorithm.id,
    courseId: algorithms.id,
    progress: 0.7157909558927918,
    user: cersei.id,
    date: 'Tue Sep 03 2019',
  });

  await addLessonProgress({
    lessonId: colour.id,
    courseId: design.id,
    progress: 0.9997724533874534,
    user: cersei.id,
    date: 'Wed Sep 04 2019',
  });

  await addLessonProgress({
    lessonId: colour.id,
    courseId: design.id,
    progress: 0.9996583738069207,
    user: danaerys.id,
    date: 'Thu Sep 05 2019',
  });

  await addLessonProgress({
    lessonId: reactIsALibrary.id,
    courseId: reactjs.id,
    progress: 0.9910822745965276,
    user: danaerys.id,
    date: 'Thu Sep 05 2019',
  });

  await addLessonProgress({
    lessonId: javascript.id,
    courseId: typescript.id,
    progress: 0.4893136075218903,
    user: danaerys.id,
    date: 'Thu Sep 05 2019',
  });

  await addLessonProgress({
    lessonId: reactIsALibrary.id,
    courseId: reactjs.id,
    progress: 0.750646508825643,
    user: jon.id,
    date: 'Thu Sep 05 2019',
  });

  await addLessonProgress({
    lessonId: filmHistory.id,
    courseId: filmStudy.id,
    progress: 0.750646508825643,
    user: jon.id,
    date: 'Thu Sep 05 2019',
  });

  await addLessonProgress({
    lessonId: javascript.id,
    courseId: typescript.id,
    progress: 0.9994703408189597,
    user: severus.id,
    date: 'Thu Sep 05 2019',
  });

  await addLessonProgress({
    lessonId: javascript.id,
    courseId: typescript.id,
    progress: 0.9982460753326907,
    user: cersei.id,
    date: 'Thu Sep 05 2019',
  });
};
