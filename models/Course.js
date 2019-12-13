module.exports = {
  attributes: {
    id: { type: 'string', columnName: '_id' },
    isDeleted: { type: 'number', defaultsTo: 0 },
    numberOfLessonsToAdd: { type: 'number', defaultsTo: 1 },
    rating: { type: 'number', defaultsTo: 0 },
    title: { type: 'string', required: true },
    description: { type: 'string', required: false },
    image: { type: 'string', required: false },
    authors: {
      collection: 'user',
      via: 'courses',
    },
    tags: {
      collection: 'tag',
      via: 'courses',
    },
    lessons: {
      collection: 'lesson',
      via: 'course',
    },
  },
};
