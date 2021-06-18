const mongoose = require('mongoose');
const { Schema } = mongoose;

const contactSchema = new Schema(
  {
    name: {
      type: String,
      minLength: 2,
      maxLength: 30,
      required: [true, 'Set name for contact'],
    },
    email: {
      type: String,
      unique: true,
      required: [true, 'Set email for contact'],
      validate: (value) => value.includes('@'),
    },
    phone: {
      type: String,
      unique: true,
      required: [true, 'Set phone for contact'],
    },
    favorite: {
      type: Boolean,
      default: false,
    },
  },
  { versionKey: false, timestamps: true }
);

module.exports = contactSchema;
