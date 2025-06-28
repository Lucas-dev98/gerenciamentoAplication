const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    type: {
      type: String,
      enum: ['info', 'warning', 'urgent', 'announcement', 'maintenance'],
      default: 'info',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    targetAudience: {
      type: String,
      enum: ['all', 'students', 'teachers', 'staff', 'admins'],
      default: 'all',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    publishDate: {
      type: Date,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
    },
    views: {
      type: Number,
      default: 0,
    },
    attachments: [
      {
        filename: String,
        url: String,
        fileType: String,
        fileSize: Number,
      },
    ],
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    readBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        readAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual para verificar se o aviso expirou
noticeSchema.virtual('isExpired').get(function () {
  return this.expiryDate && this.expiryDate < new Date();
});

// Virtual para calcular dias restantes até expirar
noticeSchema.virtual('daysUntilExpiry').get(function () {
  if (!this.expiryDate) return null;
  const diff = this.expiryDate - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// Virtual para calcular percentual de leitura
noticeSchema.virtual('readPercentage').get(function () {
  if (this.views === 0) return 0;
  return Math.round((this.readBy.length / this.views) * 100);
});

// Índices para performance
noticeSchema.index({ author: 1 });
noticeSchema.index({ type: 1 });
noticeSchema.index({ priority: 1 });
noticeSchema.index({ targetAudience: 1 });
noticeSchema.index({ publishDate: -1 });
noticeSchema.index({ expiryDate: 1 });
noticeSchema.index({ isPinned: -1, publishDate: -1 });

// Middleware para incrementar views
noticeSchema.methods.incrementViews = function () {
  this.views += 1;
  return this.save();
};

// Middleware para marcar como lido por um usuário
noticeSchema.methods.markAsRead = function (userId) {
  const alreadyRead = this.readBy.find(
    (read) => read.user.toString() === userId
  );
  if (!alreadyRead) {
    this.readBy.push({ user: userId });
    return this.save();
  }
  return Promise.resolve(this);
};

module.exports = mongoose.model('Notice', noticeSchema);
