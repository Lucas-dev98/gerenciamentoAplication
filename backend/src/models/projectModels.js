const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'completed', 'cancelled', 'on-hold'],
      default: 'draft',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    deadline: {
      type: Date,
    },
    budget: {
      type: Number,
      min: 0,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    team: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        role: {
          type: String,
          enum: ['manager', 'developer', 'designer', 'tester', 'analyst'],
          default: 'developer',
        },
      },
    ],
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    // Novos campos para projetos importados de CSV
    metadata: {
      csvImport: {
        type: Boolean,
        default: false,
      },
      estatisticas: {
        totalAtividades: Number,
        atividadesCompletas: Number,
        progressoGeral: Number,
        progressoPorBloco: mongoose.Schema.Types.Mixed,
      },
      blocos: {
        parada: Number,
        manutencao: Number,
        partida: Number,
      },
      processedAt: Date,
    },
    // Atividades detalhadas do CSV
    activities: [
      {
        name: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          enum: ['parada', 'manutencao', 'partida'],
          required: true,
        },
        progress: {
          type: Number,
          min: 0,
          max: 100,
          default: 0,
        },
        baseline: {
          type: Number,
          min: 0,
          max: 100,
          default: 0,
        },
        subActivities: [
          {
            name: String,
            progress: Number,
            baseline: Number,
          },
        ],
        order: {
          type: Number,
          default: 0,
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

// Virtual para calcular se o projeto está atrasado
projectSchema.virtual('isOverdue').get(function () {
  return (
    this.deadline && this.deadline < new Date() && this.status !== 'completed'
  );
});

// Virtual para calcular duração estimada
projectSchema.virtual('estimatedDuration').get(function () {
  if (this.startDate && this.endDate) {
    return Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24)); // dias
  }
  return null;
});

// Índices para performance
projectSchema.index({ owner: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ priority: 1 });
projectSchema.index({ deadline: 1 });

module.exports = mongoose.model('Project', projectSchema);
