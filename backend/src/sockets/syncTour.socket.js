/**
 * ArtAround Real-Time Synchronized Tour & Quiz WebSocket Handler
 * 
 * Manages mnemonic rooms (e.g. "Fenice rossa") for Teacher/Guide and Student/Visitor synchronization,
 * map location broadcasting, floor transitions, and competency Quiz administration.
 */

const Quiz = require('../models/Quiz');
const Visit = require('../models/Visit');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// In-memory active synchronized tour sessions
const activeSessions = new Map();

function initSyncTourSockets(io) {
  const syncNamespace = io.of('/sync-tour');

  syncNamespace.on('connection', (socket) => {
    console.log(`[Socket.io] Client connesso a /sync-tour: ${socket.id}`);

    /**
     * Teacher creates or resets a mnemonic synchronized session
     */
    socket.on('teacher:create_session', async (payload) => {
      const mnemonicName = (payload?.mnemonicName || 'Fenice rossa').trim();
      const visitId = payload?.visitId;
      const museumId = payload?.museumId || 'PIN-BO';

      socket.join(mnemonicName);
      socket.mnemonicRoom = mnemonicName;
      socket.isTeacher = true;

      // Always create a clean, fresh session state for the newly started session
      const session = {
        mnemonicName,
        teacherSocketId: socket.id,
        visitId,
        museumId,
        currentIndex: 0,
        activeLayerId: 1,
        userPos: { x: 0, y: 0 },
        isPlaying: false,
        visitors: new Set(),
        visitorsList: new Map(),
        quizResults: [],
        inquiries: []
      };

      activeSessions.set(mnemonicName, session);

      console.log(`[Socket.io] Nuova sessione Docente creata e dati azzerati per: "${mnemonicName}"`);

      socket.emit('teacher:session_created', {
        mnemonicName,
        visitorsCount: 0,
        session
      });

      // Send empty student list and inquiries to teacher
      socket.emit('teacher:connected_students', {
        students: [],
        count: 0,
        inquiries: []
      });
    });

    /**
     * Teacher ends the session: cleans memory and terminates all student sessions
     */
    socket.on('teacher:end_session', (payload) => {
      const mnemonicName = socket.mnemonicRoom || payload?.mnemonicName || 'Fenice rossa';
      console.log(`[Socket.io] Sessione Docente chiusa per "${mnemonicName}". Pulizia completa dati.`);

      // Remove session from memory completely
      activeSessions.delete(mnemonicName);

      // Broadcast termination to all visitors/students in the room
      syncNamespace.to(mnemonicName).emit('sync:session_ended', {
        mnemonicName,
        message: 'La Docente ha terminato la visita guidata sincronizzata.'
      });

      // Also force-leave for all sockets currently in this room
      const roomSockets = syncNamespace.adapter.rooms.get(mnemonicName);
      if (roomSockets) {
        for (const sockId of Array.from(roomSockets)) {
          const s = syncNamespace.sockets.get(sockId);
          if (s) {
            s.emit('sync:session_ended', {
              mnemonicName,
              message: 'La Docente ha terminato la visita guidata sincronizzata.'
            });
            s.leave(mnemonicName);
            s.mnemonicRoom = null;
            s.isTeacher = false;
          }
        }
      }

      socket.leave(mnemonicName);
      socket.mnemonicRoom = null;
      socket.isTeacher = false;
    });

    /**
     * Visitor joins a mnemonic synchronized session (Classroom Sync Tour)
     */
    socket.on('visitor:join_session', async (payload) => {
      const mnemonicName = (payload?.mnemonicName || 'Fenice rossa').trim();
      const visitorName = (payload?.visitorName || `Studente_${socket.id.substring(0, 4)}`).trim();

      socket.join(mnemonicName);
      socket.mnemonicRoom = mnemonicName;
      socket.visitorName = visitorName;
      socket.isTeacher = false;

      let session = activeSessions.get(mnemonicName);
      if (!session) {
        session = {
          mnemonicName,
          teacherSocketId: null,
          currentIndex: 0,
          activeLayerId: 1,
          userPos: { x: 0, y: 0 },
          isPlaying: false,
          visitors: new Set(),
          visitorsList: new Map(),
          quizResults: [],
          inquiries: []
        };
        activeSessions.set(mnemonicName, session);
      }

      session.visitors.add(socket.id);
      if (!session.visitorsList) session.visitorsList = new Map();
      session.visitorsList.set(socket.id, {
        socketId: socket.id,
        visitorName: visitorName,
        joinedAt: new Date()
      });

      console.log(`[Socket.io] Studente/Visitatore "${visitorName}" (socket: ${socket.id}) unito a stanza: "${mnemonicName}". Totale: ${session.visitors.size}`);

      // Send current state to newly joined visitor
      socket.emit('sync:state_changed', {
        mnemonicName,
        currentIndex: session.currentIndex,
        activeLayerId: session.activeLayerId,
        userPos: session.userPos,
        isPlaying: session.isPlaying,
        message: `Sei sincronizzato con la sessione "${mnemonicName}".`
      });

      // Broadcast updated participant count and student list to all in room (including teacher)
      const studentsList = Array.from(session.visitorsList.values());
      syncNamespace.to(mnemonicName).emit('sync:participant_count', {
        count: session.visitors.size,
        visitorName
      });

      syncNamespace.to(mnemonicName).emit('teacher:connected_students', {
        students: studentsList,
        count: studentsList.length,
        inquiries: session.inquiries || []
      });
    });

    /**
     * Visitor asks a question or requests deeper explanation
     */
    socket.on('visitor:ask_question', (payload) => {
      const mnemonicName = socket.mnemonicRoom || payload?.mnemonicName;
      if (!mnemonicName) return;

      const session = activeSessions.get(mnemonicName);
      const inquiry = {
        id: Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        visitorName: socket.visitorName || payload?.visitorName || 'Studente',
        artworkTitle: payload?.artworkTitle || 'Opera Corrente',
        text: payload?.text || payload?.question || 'Richiesta di approfondimento',
        type: payload?.type || 'domanda',
        timestamp: new Date()
      };

      if (session) {
        if (!session.inquiries) session.inquiries = [];
        session.inquiries.unshift(inquiry); // newest first
        if (session.inquiries.length > 50) session.inquiries.pop();

        syncNamespace.to(mnemonicName).emit('teacher:student_inquiry', {
          inquiry,
          allInquiries: session.inquiries
        });
      }

      console.log(`[Socket.io] Domanda da ${inquiry.visitorName} nella stanza "${mnemonicName}": "${inquiry.text}" (Opera: ${inquiry.artworkTitle})`);
    });

    /**
     * Visitor leaves the synchronized room
     */
    socket.on('visitor:leave_session', (payload) => {
      const mnemonicName = socket.mnemonicRoom || payload?.mnemonicName;
      if (!mnemonicName) return;

      const session = activeSessions.get(mnemonicName);
      if (session) {
        session.visitors.delete(socket.id);
        if (session.visitorsList) session.visitorsList.delete(socket.id);

        const studentsList = Array.from(session.visitorsList.values());
        syncNamespace.to(mnemonicName).emit('sync:participant_count', {
          count: session.visitors.size
        });
        syncNamespace.to(mnemonicName).emit('teacher:connected_students', {
          students: studentsList,
          count: studentsList.length,
          inquiries: session.inquiries || []
        });
      }

      socket.leave(mnemonicName);
      socket.mnemonicRoom = null;
      console.log(`[Socket.io] Visitatore uscito dalla stanza "${mnemonicName}"`);
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

      console.log(`[Socket.io] Docente avvia Quiz per la stanza: "${mnemonicName}"`, payload?.quizId || payload?.quiz?.title || 'default');

      let quizData = payload?.quiz;

      if (!quizData && payload?.quizId) {
        try {
          quizData = await Quiz.findById(payload.quizId);
        } catch (e) {
          console.warn("Could not fetch quiz by ID:", e);
        }
      }

      // Try to find Quiz from DB by museum or any
      if (!quizData) {
        try {
          const session = activeSessions.get(mnemonicName);
          const museumId = session?.museumId || 'PIN-BO';
          quizData = await Quiz.findOne({ $or: [{ museumId }, { museum: museumId }] });
          if (!quizData) quizData = await Quiz.findOne();
        } catch (e) {
          console.warn("Could not fetch quiz from DB:", e);
        }
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

      // Reset quiz results for the new quiz
      const session = activeSessions.get(mnemonicName);
      if (session) {
        session.quizResults = [];
      }

      // Broadcast quiz ONLY to students in room (EXCLUDE the teacher)
      socket.to(mnemonicName).emit('sync:quiz_started', {
        mnemonicName,
        quiz: quizData
      });

      // Acknowledge teacher that quiz is active
      socket.emit('teacher:quiz_started', {
        mnemonicName,
        quiz: quizData,
        message: `Quiz "${quizData.title}" somministrato con successo agli studenti della classe!`
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
      if (session) {
        syncNamespace.to(mnemonicName).emit('teacher:quiz_result', {
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
        if (session.visitorsList) {
          session.visitorsList.delete(socket.id);
        }
        if (socket.isTeacher) {
          session.teacherSocketId = null;
        }
        syncNamespace.to(mnemonicName).emit('sync:participant_count', {
          count: session.visitors.size
        });
        if (session.teacherSocketId) {
          const studentsList = Array.from(session.visitorsList.values());
          syncNamespace.to(session.teacherSocketId).emit('teacher:connected_students', {
            students: studentsList,
            count: studentsList.length,
            inquiries: session.inquiries || []
          });
        }
      }
      console.log(`[Socket.io] Client disconnesso: ${socket.id}`);
    });
  });
}

module.exports = { initSyncTourSockets };
