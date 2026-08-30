/**
 * ArtAround Real-Time Synchronized Tour & Quiz WebSocket Handler
 * 
 * Manages mnemonic rooms (e.g. "Fenice rossa") for Teacher/Guide and Student/Visitor synchronization,
 * map location broadcasting, floor transitions, and competency Quiz administration.
 */

const Quiz = require('../models/Quiz');
const Visit = require('../models/Visit');

// In-memory active synchronized tour sessions
const activeSessions = new Map();

function initSyncTourSockets(io) {
  const syncNamespace = io.of('/sync-tour');

  syncNamespace.on('connection', (socket) => {
    console.log(`[Socket.io] Client connesso a /sync-tour: ${socket.id}`);

    /**
     * Teacher creates or takes control of a mnemonic synchronized session
     */
    socket.on('teacher:create_session', async (payload) => {
      const mnemonicName = (payload?.mnemonicName || 'Fenice rossa').trim();
      const visitId = payload?.visitId;
      const museumId = payload?.museumId || 'PIN-BO';

      socket.join(mnemonicName);
      socket.mnemonicRoom = mnemonicName;
      socket.isTeacher = true;

      // Initialize session state
      let session = activeSessions.get(mnemonicName) || {
        mnemonicName,
        teacherSocketId: socket.id,
        visitId,
        museumId,
        currentIndex: 0,
        activeLayerId: 1,
        userPos: { x: 0, y: 0 },
        isPlaying: false,
        visitors: new Set(),
        quizResults: []
      };

      session.teacherSocketId = socket.id;
      activeSessions.set(mnemonicName, session);

      console.log(`[Socket.io] Sessione Docente creata per: "${mnemonicName}"`);

      socket.emit('teacher:session_created', {
        mnemonicName,
        visitorsCount: session.visitors.size,
        session
      });
    });

    /**
     * Visitor joins a mnemonic synchronized session
     */
    socket.on('visitor:join_session', async (payload) => {
      const mnemonicName = (payload?.mnemonicName || 'Fenice rossa').trim();
      const visitorName = payload?.visitorName || `Visitatore_${socket.id.substring(0, 4)}`;

      socket.join(mnemonicName);
      socket.mnemonicRoom = mnemonicName;
      socket.visitorName = visitorName;
      socket.isTeacher = false;

      let session = activeSessions.get(mnemonicName);
      if (!session) {
        // Create an empty session entry if teacher hasn't connected yet
        session = {
          mnemonicName,
          teacherSocketId: null,
          currentIndex: 0,
          activeLayerId: 1,
          userPos: { x: 0, y: 0 },
          isPlaying: false,
          visitors: new Set(),
          quizResults: []
        };
        activeSessions.set(mnemonicName, session);
      }

      session.visitors.add(socket.id);

      console.log(`[Socket.io] Visitatore "${visitorName}" unito a: "${mnemonicName}". Totale: ${session.visitors.size}`);

      // Send current state to newly joined visitor
      socket.emit('sync:state_changed', {
        mnemonicName,
        currentIndex: session.currentIndex,
        activeLayerId: session.activeLayerId,
        userPos: session.userPos,
        isPlaying: session.isPlaying,
        message: `Sei sincronizzato con la sessione "${mnemonicName}".`
      });

      // Notify teacher and room of new participant count
      syncNamespace.to(mnemonicName).emit('sync:participant_count', {
        count: session.visitors.size,
        visitorName
      });
    });

    /**
     * Teacher broadcasts position, exhibit change or audio state
     */
    socket.on('teacher:update_state', (payload) => {
      const mnemonicName = socket.mnemonicRoom || payload?.mnemonicName;
      if (!mnemonicName) return;

      let session = activeSessions.get(mnemonicName);
      if (session) {
        if (payload.currentIndex !== undefined) session.currentIndex = payload.currentIndex;
        if (payload.activeLayerId !== undefined) session.activeLayerId = payload.activeLayerId;
        if (payload.userPos !== undefined) session.userPos = payload.userPos;
        if (payload.isPlaying !== undefined) session.isPlaying = payload.isPlaying;
      }

      // Broadcast new state to all visitors in the room
      socket.to(mnemonicName).emit('sync:state_changed', {
        mnemonicName,
        currentIndex: payload.currentIndex,
        activeLayerId: payload.activeLayerId,
        userPos: payload.userPos,
        isPlaying: payload.isPlaying,
        message: payload.message
      });
    });

    /**
     * Teacher starts the final competency Quiz
     */
    socket.on('teacher:start_quiz', async (payload) => {
      const mnemonicName = socket.mnemonicRoom || payload?.mnemonicName;
      if (!mnemonicName) return;

      console.log(`[Socket.io] Docente avvia Quiz per la stanza: "${mnemonicName}"`);

      // Try to find Quiz from DB or use standard Pinacoteca Quiz
      let quizData = null;
      try {
        quizData = await Quiz.findOne();
      } catch (e) {
        console.warn("Could not fetch quiz from DB:", e);
      }

      if (!quizData) {
        quizData = {
          title: "Quiz di Competenza: I Capolavori della Pinacoteca",
          description: "Metti alla prova le tue conoscenze sui dipinti visti durante la visita guidata con la classe.",
          timeLimitMinutes: 10,
          questions: [
            {
              question: "Quale celebre santo è raffigurato nel ritratto di frate dipinto da Girolamo Mazzola Bedoli?",
              options: ["San Tommaso d'Aquino", "San Francesco d'Assisi", "San Petronio", "San Domenico"],
              correctAnswerIndex: 0,
              explanation: "Il dipinto del Bedoli raffigura un frate domenicano con gli attributi iconografici di San Tommaso d'Aquino (sole radiante e libro)."
            },
            {
              question: "Quale strumento musicale suona Santa Cecilia nel celebre dipinto di Raffaello?",
              options: ["Liuto", "Organo portatile", "Arpa", "Violino"],
              correctAnswerIndex: 1,
              explanation: "Nell'Estasi di Santa Cecilia di Raffaello, la santa regge un organo portatile le cui canne scivolano verso il basso mentre ascolta il coro angelico."
            },
            {
              question: "Quale schema compositivo caratterizza la 'Strage degli innocenti' di Guido Reni?",
              options: ["Piramidale inverso", "Orizzontale a fregio", "Circolare", "Prospettiva aerea"],
              correctAnswerIndex: 0,
              explanation: "Guido Reni impiega una calibratissima struttura a piramide rovesciata con le due figure dei carnefici in alto."
            },
            {
              question: "In quale epoca e stile si colloca il 'San Giorgio e il drago' di Vitale da Bologna?",
              options: ["Barocco seicentesco", "Gotico trecentesco", "Neoclassicismo", "Manierismo"],
              correctAnswerIndex: 1,
              explanation: "Vitale da Bologna realizzò il capolavoro tra il 1335 e il 1340, vertice del dinamismo gotico bolognese."
            },
            {
              question: "Quale famiglia di pittori diede vita alla celebre Accademia degli Incamminati a Bologna?",
              options: ["I Medici", "I Carracci (Annibale, Agostino, Ludovico)", "I Gonzaga", "I Della Rovere"],
              correctAnswerIndex: 1,
              explanation: "I cugini Carracci fondarono a Bologna l'Accademia degli Incamminati, rinnovando la pittura italiana con il ritorno al disegno e al naturale."
            }
          ]
        };
      }

      // Broadcast quiz to all devices in room
      syncNamespace.to(mnemonicName).emit('sync:quiz_started', {
        mnemonicName,
        quiz: quizData
      });
    });

    /**
     * Visitor submits quiz answers
     */
    socket.on('visitor:submit_quiz', (payload) => {
      const mnemonicName = socket.mnemonicRoom || payload?.mnemonicName;
      if (!mnemonicName) return;

      const session = activeSessions.get(mnemonicName);
      const resultEntry = {
        visitorName: socket.visitorName || payload.visitorName || 'Studente',
        score: payload.score,
        total: payload.total,
        percentage: Math.round((payload.score / payload.total) * 100),
        submittedAt: new Date()
      };

      if (session) {
        session.quizResults.push(resultEntry);
      }

      console.log(`[Socket.io] Quiz inviato da ${resultEntry.visitorName}: ${resultEntry.score}/${resultEntry.total} (${resultEntry.percentage}%)`);

      // Notify teacher of the new quiz submission
      if (session && session.teacherSocketId) {
        syncNamespace.to(session.teacherSocketId).emit('teacher:quiz_result', {
          result: resultEntry,
          allResults: session.quizResults
        });
      }
    });

    /**
     * Disconnect handler
     */
    socket.on('disconnect', () => {
      const mnemonicName = socket.mnemonicRoom;
      if (mnemonicName && activeSessions.has(mnemonicName)) {
        const session = activeSessions.get(mnemonicName);
        session.visitors.delete(socket.id);
        if (socket.isTeacher) {
          session.teacherSocketId = null;
        }
        syncNamespace.to(mnemonicName).emit('sync:participant_count', {
          count: session.visitors.size
        });
      }
      console.log(`[Socket.io] Client disconnesso: ${socket.id}`);
    });
  });
}

module.exports = { initSyncTourSockets };
