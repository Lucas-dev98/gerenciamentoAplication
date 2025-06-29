const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Nome do evento é obrigatório'],
      trim: true,
      maxlength: [100, 'Nome do evento deve ter no máximo 100 caracteres'],
    },

    eventType: {
      type: String,
      required: [true, 'Tipo do evento é obrigatório'],
      enum: {
        values: [
          'reuniao',
          'treinamento',
          'manutencao',
          'inspecao',
          'auditoria',
          'emergencia',
          'outro',
        ],
        message:
          'Tipo de evento deve ser: reuniao, treinamento, manutencao, inspecao, auditoria, emergencia ou outro',
      },
    },

    date: {
      type: Date,
      required: [true, 'Data do evento é obrigatória'],
    },

    time: {
      type: String,
      required: [true, 'Hora do evento é obrigatória'],
      match: [
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        'Formato de hora inválido (HH:mm)',
      ],
    },

    location: {
      type: String,
      required: [true, 'Local do evento é obrigatório'],
      trim: true,
      maxlength: [200, 'Local deve ter no máximo 200 caracteres'],
    },

    observations: {
      type: String,
      trim: true,
      maxlength: [1000, 'Observações devem ter no máximo 1000 caracteres'],
    },

    // Campos de controle
    status: {
      type: String,
      enum: ['agendado', 'em_andamento', 'concluido', 'cancelado'],
      default: 'agendado',
    },

    // Relacionamento com projetos (opcional)
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: false,
    },

    // Usuário que criou o evento
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Participantes (opcional para futuras expansões)
    participants: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        status: {
          type: String,
          enum: ['convidado', 'confirmado', 'rejeitado'],
          default: 'convidado',
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Índices para melhor performance
eventSchema.index({ date: 1 });
eventSchema.index({ eventType: 1 });
eventSchema.index({ createdBy: 1 });
eventSchema.index({ project: 1 });

// Virtual para formatação de data e hora
eventSchema.virtual('dateTimeFormatted').get(function () {
  if (this.date && this.time) {
    const dateStr = this.date.toLocaleDateString('pt-BR');
    return `${dateStr} às ${this.time}`;
  }
  return '';
});

// Método para verificar se o evento é hoje
eventSchema.methods.isToday = function () {
  const today = new Date();
  const eventDate = new Date(this.date);
  return today.toDateString() === eventDate.toDateString();
};

// Método para verificar se o evento passou
eventSchema.methods.isPast = function () {
  const now = new Date();
  const eventDateTime = new Date(this.date);
  const [hours, minutes] = this.time.split(':');
  eventDateTime.setHours(parseInt(hours), parseInt(minutes));
  return eventDateTime < now;
};

module.exports = mongoose.model('Event', eventSchema);
