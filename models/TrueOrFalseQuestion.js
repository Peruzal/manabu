module.exports = {
  attributes: {
    id: { type: 'string', columnName: '_id' },
    statement: { type: 'string', required: true },
    answer: { type: 'string', required: true },
    courseId: { type: 'string', required: true },
    lessonId: { type: 'string', required: true }
  }
};
