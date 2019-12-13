const { addLesson } = require('../../services/lessonService');
const LessonTypes = require('../../models/LessonTypes');

exports.func = async function migrate(models) {
  const Course = models.getModel('course');
  const Tag = models.getModel('tag');
  const User = models.getModel('user');

  const course = await Course.create({
    title: 'Principles of Design',
    image: 'http://localhost:3005/uploads/Manabu_round_icon_extra02.png',
    rating: 4.8,
    description:
        'Learn some of the industry standards regarding good design.',
  }).fetch();

  const cersei = await User.findOne({ name: 'Cersei' });
  const albus = await User.findOne({ name: 'Albus' });
  const allAuthors = [cersei, albus];

  const ui = await Tag.findOne({ label: 'UI' });
  const colours = await Tag.findOne({ label: 'Colours' });
  const allTags = [ui, colours];

  await Course.addToCollection(course.id, 'authors', allAuthors.map(a => a.id));
  await Course.addToCollection(course.id, 'tags', allTags.map(t => t.id));

  await addLesson({
    title: 'Examples of Bad Use of Colour',
    type: LessonTypes.VIDEO,
    source: 'http://localhost:3005/uploads/5dea3c1cfa6ae0c4cf9495c4-5df106e276a23c582d0ecfc2.mp4',
    course: course.id,
    durationInSeconds: 660,
    order: 100,
    markdown:
      'We will look at how bad colour combinations may lead to ugly designs.',
  }, allAuthors, allTags);
};
