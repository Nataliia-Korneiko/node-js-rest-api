const { model } = require('mongoose');
const { contactSchema } = require('./schemas');
const mongoosePaginate = require('mongoose-paginate-v2');

contactSchema.plugin(mongoosePaginate);

const Contact = model('contact', contactSchema);

module.exports = Contact;
