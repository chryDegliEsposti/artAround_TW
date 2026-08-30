const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

const User = require('../models/User');
const Museum = require('../models/Museum');
const Item = require('../models/Item');
const Visit = require('../models/Visit');
const Quiz = require('../models/Quiz');

const seedDatabase = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/artaround';
        console.log(`[Seed] Connessione a MongoDB: ${mongoUri}...`);
        await mongoose.connect(mongoUri);
        console.log('[Seed] Connesso con successo!');

        // 1. Pulizia Database esistente
        console.log('[Seed] Pulizia collezioni...');
        await Promise.all([
            User.deleteMany({}),
            Museum.deleteMany({}),
            Item.deleteMany({}),
            Visit.deleteMany({}),
            Quiz.deleteMany({})
        ]);

        // 2. Creazione Account Obbligatori (Password '12345678')
        console.log('[Seed] Creazione account obbligatori...');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('12345678', salt);

        const usersData = [
            {
                username: 'autore1',
                email: 'autore1@artaround.it',
                password: hashedPassword,
                role: 'creator'
            },
            {
                username: 'autore2',
                email: 'autore2@artaround.it',
                password: hashedPassword,
                role: 'creator'
            },
            {
                username: 'visitatore1',
                email: 'visitatore1@artaround.it',
                password: hashedPassword,
                role: 'visitor'
            },
            {
                username: 'visitatore2',
                email: 'visitatore2@artaround.it',
                password: hashedPassword,
                role: 'visitor'
            },
            {
                username: 'docente1',
                email: 'docente1@artaround.it',
                password: hashedPassword,
                role: 'teacher'
            }
        ];

        const [autore1, autore2, visitatore1, visitatore2, docente1] = await User.create(usersData);
        console.log(`[Seed] Creati 5 utenti (inclusi i 4 obbligatori + docente1).`);

        // 3. Creazione Geometria e Mappa 2D della Pinacoteca Nazionale di Bologna
        console.log('[Seed] Creazione museo reale: Pinacoteca Nazionale di Bologna...');
        
        // Muri dell'edificio storico (Piano 1 e 2)
        const pinacotecaLines = [
            // Pareti esterne Piano 1
            {
                id: 1001,
                type: 'ext-wall',
                layerId: 1,
                points: [
                    { lat: 44.4980, lng: 11.3525, x: -3000, y: -4000 },
                    { lat: 44.4980, lng: 11.3545, x: 3000, y: -4000 },
                    { lat: 44.4970, lng: 11.3545, x: 3000, y: 4000 },
                    { lat: 44.4970, lng: 11.3525, x: -3000, y: 4000 },
                    { lat: 44.4980, lng: 11.3525, x: -3000, y: -4000 }
                ]
            },
            // Pareti interne / divisori sale Piano 1
            {
                id: 1002,
                type: 'int-wall',
                layerId: 1,
                points: [
                    { lat: 44.4975, lng: 11.3525, x: -3000, y: 0 },
                    { lat: 44.4975, lng: 11.3545, x: 1000, y: 0 }
                ]
            },
            {
                id: 1003,
                type: 'int-wall',
                layerId: 1,
                points: [
                    { lat: 44.4980, lng: 11.3535, x: 0, y: -4000 },
                    { lat: 44.4975, lng: 11.3535, x: 0, y: 0 }
                ]
            },
            {
                id: 1004,
                type: 'int-wall',
                layerId: 1,
                points: [
                    { lat: 44.4975, lng: 11.3535, x: 0, y: 1000 },
                    { lat: 44.4970, lng: 11.3535, x: 0, y: 4000 }
                ]
            },
            // Pareti esterne Piano 2 (Sezione Manierismo e Barocco)
            {
                id: 2001,
                type: 'ext-wall',
                layerId: 2,
                points: [
                    { lat: 44.4980, lng: 11.3525, x: -3000, y: -4000 },
                    { lat: 44.4980, lng: 11.3545, x: 3000, y: -4000 },
                    { lat: 44.4970, lng: 11.3545, x: 3000, y: 4000 },
                    { lat: 44.4970, lng: 11.3525, x: -3000, y: 4000 },
                    { lat: 44.4980, lng: 11.3525, x: -3000, y: -4000 }
                ]
            },
            {
                id: 2002,
                type: 'int-wall',
                layerId: 2,
                points: [
                    { lat: 44.4975, lng: 11.3525, x: -3000, y: 0 },
                    { lat: 44.4975, lng: 11.3545, x: 3000, y: 0 }
                ]
            }
        ];

        // Aree funzionali (Bar, Toilette, Bookshop)
        const pinacotecaAreas = [
            {
                id: 3001,
                type: 'restaurant',
                subType: 'bar',
                name: 'Caffetteria della Pinacoteca',
                layerId: 1,
                points: [
                    { lat: 44.4972, lng: 11.3540, x: 1800, y: 2500 },
                    { lat: 44.4972, lng: 11.3544, x: 2800, y: 2500 },
                    { lat: 44.4970, lng: 11.3544, x: 2800, y: 3800 },
                    { lat: 44.4970, lng: 11.3540, x: 1800, y: 3800 }
                ]
            },
            {
                id: 3002,
                type: 'restroom',
                subType: 'wc',
                name: 'Servizi Igienici Piano Terra',
                layerId: 1,
                points: [
                    { lat: 44.4970, lng: 11.3526, x: -2800, y: 2800 },
                    { lat: 44.4970, lng: 11.3530, x: -1600, y: 2800 },
                    { lat: 44.4968, lng: 11.3530, x: -1600, y: 3800 },
                    { lat: 44.4968, lng: 11.3526, x: -2800, y: 3800 }
                ]
            },
            {
                id: 3003,
                type: 'restroom',
                subType: 'wc',
                name: 'Servizi Igienici Primo Piano',
                layerId: 2,
                points: [
                    { lat: 44.4970, lng: 11.3526, x: -2800, y: 2800 },
                    { lat: 44.4970, lng: 11.3530, x: -1600, y: 2800 },
                    { lat: 44.4968, lng: 11.3530, x: -1600, y: 3800 },
                    { lat: 44.4968, lng: 11.3526, x: -2800, y: 3800 }
                ]
            }
        ];

        // 12 Opere Reali con POI posizionati
        const pinacotecaPOIs = [
            // Servizi e Porte
            {
                id: 4001,
                type: 'exit',
                subType: 'entrance',
                name: 'Ingresso Principale (Via delle Belle Arti)',
                desc: 'Biglietteria, guardaroba e punto accoglienza.',
                position: { lat: 44.4970, lng: 11.3535, x: 0, y: 3800 },
                layerId: 1
            },
            {
                id: 4002,
                type: 'exit',
                subType: 'emergency',
                name: 'Uscita di Emergenza Ala Nord',
                desc: 'Uscita di sicurezza verso il cortile interno.',
                position: { lat: 44.4980, lng: 11.3545, x: 2800, y: -3800 },
                layerId: 1
            },
            {
                id: 4003,
                type: 'restroom',
                subType: 'wc',
                name: 'Toilette',
                desc: 'Servizi igienici accessibili a tutti.',
                position: { lat: 44.4969, lng: 11.3528, x: -2200, y: 3300 },
                layerId: 1
            },
            {
                id: 4004,
                type: 'restaurant',
                subType: 'bar',
                name: 'Caffetteria & Bookshop',
                desc: 'Punto ristoro, caffè e libri d\'arte.',
                position: { lat: 44.4971, lng: 11.3542, x: 2300, y: 3200 },
                layerId: 1
            },
            {
                id: 4005,
                type: 'stairs',
                subType: 'elevator',
                name: 'Ascensore e Scale per Piano 1',
                desc: 'Collegamento tra Sezione Rinascimento e Sezione Barocco.',
                position: { lat: 44.4975, lng: 11.3542, x: 2400, y: 0 },
                layerId: 1
            },

            // --- LE 12 OPERE D'ARTE ---
            // Opera 1: Giotto (Sala 1, Piano 1)
            {
                id: 5001,
                type: 'exhibit',
                name: 'Polittico di Bologna',
                artworkId: 'Q3907519',
                desc: 'Giotto e bottega, 1330 circa. Capolavoro trecentesco a fondo oro.',
                position: { lat: 44.4972, lng: 11.3528, x: -2000, y: 2000 },
                layerId: 1
            },
            // Opera 2: Vitale da Bologna (Sala 1, Piano 1)
            {
                id: 5002,
                type: 'exhibit',
                name: 'San Giorgio e il drago',
                artworkId: 'Q3947230',
                desc: 'Vitale da Bologna, 1335-1340. Dinamismo ed espressività del gotico emiliano.',
                position: { lat: 44.4974, lng: 11.3528, x: -2000, y: 600 },
                layerId: 1
            },
            // Opera 3: Francesco Francia (Sala 2, Piano 1)
            {
                id: 5003,
                type: 'exhibit',
                name: 'Pala Felicini',
                artworkId: 'Q11500001',
                desc: 'Francesco Francia, 1494. Sacra Conversazione con armonia prospettica.',
                position: { lat: 44.4978, lng: 11.3528, x: -2000, y: -2000 },
                layerId: 1
            },
            // Opera 4: Lorenzo Costa (Sala 2, Piano 1)
            {
                id: 5004,
                type: 'exhibit',
                name: 'Matrimonio mistico di santa Caterina',
                artworkId: 'Q11500002',
                desc: 'Lorenzo Costa, 1505 circa. Tonalità calde del Rinascimento bolognese.',
                position: { lat: 44.4978, lng: 11.3532, x: -800, y: -2000 },
                layerId: 1
            },
            // Opera 5: Perugino (Sala 3, Piano 1)
            {
                id: 5005,
                type: 'exhibit',
                name: 'Madonna in gloria e santi',
                artworkId: 'Q3842426',
                desc: 'Pietro Perugino, 1500-1501. Pala dei Carmelitani dalla soave grazia umbra.',
                position: { lat: 44.4978, lng: 11.3538, x: 800, y: -2000 },
                layerId: 1
            },
            // Opera 6: Raffaello Sanzio (Sala 3, Piano 1)
            {
                id: 5006,
                type: 'exhibit',
                name: 'Estasi di santa Cecilia',
                artworkId: 'Q2453886',
                desc: 'Raffaello, 1514-1516. Uno dei massimi vertici del Rinascimento maturo.',
                position: { lat: 44.4978, lng: 11.3542, x: 2200, y: -2000 },
                layerId: 1
            },
            // Opera 7: Girolamo Mazzola Bedoli (Sala 4, Piano 2) - CITATA NELLE SLIDE
            {
                id: 5007,
                type: 'exhibit',
                name: 'Ritratto di frate in veste di San Tommaso d\'Aquino',
                artworkId: 'Q126599960',
                desc: 'Girolamo Mazzola Bedoli, 1550 circa. Esemplare del Manierismo emiliano.',
                position: { lat: 44.4978, lng: 11.3528, x: -2000, y: -2000 },
                layerId: 2
            },
            // Opera 8: Parmigianino (Sala 4, Piano 2)
            {
                id: 5008,
                type: 'exhibit',
                name: 'Madonna di Santa Margherita',
                artworkId: 'Q3842416',
                desc: 'Parmigianino, 1530. Figure allungate e grazia sofisticata manierista.',
                position: { lat: 44.4978, lng: 11.3538, x: 1000, y: -2000 },
                layerId: 2
            },
            // Opera 9: Annibale Carracci (Sala 5, Piano 2)
            {
                id: 5009,
                type: 'exhibit',
                name: 'Assunzione della Vergine',
                artworkId: 'Q3627389',
                desc: 'Annibale Carracci, 1592. Rivoluzione naturalistica dei Carracci.',
                position: { lat: 44.4972, lng: 11.3528, x: -2000, y: 1500 },
                layerId: 2
            },
            // Opera 10: Ludovico Carracci (Sala 5, Piano 2)
            {
                id: 5010,
                type: 'exhibit',
                name: 'Annunciazione',
                artworkId: 'Q3618174',
                desc: 'Ludovico Carracci, 1584. Pathos religioso e chiaroscuro intimo.',
                position: { lat: 44.4972, lng: 11.3535, x: -500, y: 1500 },
                layerId: 2
            },
            // Opera 11: Guido Reni (Sala 6, Piano 2)
            {
                id: 5011,
                type: 'exhibit',
                name: 'Strage degli innocenti',
                artworkId: 'Q3824424',
                desc: 'Guido Reni, 1611. Vertice del classicismo seicentesco bolognese.',
                position: { lat: 44.4972, lng: 11.3542, x: 1200, y: 1500 },
                layerId: 2
            },
            // Opera 12: Guercino (Sala 6, Piano 2)
            {
                id: 5012,
                type: 'exhibit',
                name: 'San Sebastiano soccorso da Irene',
                artworkId: 'Q3947885',
                desc: 'Guercino, 1619. Dinamismo luministico e impasto pittorico corposo.',
                position: { lat: 44.4972, lng: 11.3546, x: 2400, y: 1500 },
                layerId: 2
            }
        ];

        const pinacoteca = await Museum.create({
            name: 'Pinacoteca Nazionale di Bologna',
            museumId: 'PIN-BO',
            description: 'La Pinacoteca Nazionale di Bologna custodisce la straordinaria memoria pittorica emiliana dal XIII al XVIII secolo, con capolavori assoluti di Giotto, Raffaello, Bedoli, Carracci e Guido Reni.',
            address: 'Via delle Belle Arti 56',
            city: 'Bologna',
            latitude: 44.4975,
            longitude: 11.3533,
            image: 'https://images.unsplash.com/photo-1544211152-bd450893375c?auto=format&fit=crop&q=80&w=1200',
            hours: '09:00 - 19:00 (Martedì - Domenica, Chiuso Lunedì)',
            price: '10.00€ (Intero), 2.00€ (18-25 anni)',
            accessibility: [
                'Accessibile per visitatori su sedia a rotelle',
                'Ascensori a norma per tutti i piani',
                'Servizi igienici attrezzati',
                'Dispositivi di supporto visivo e audio percorsi'
            ],
            categories: ['Arte Medievale', 'Rinascimento', 'Manierismo', 'Barocco Bolognese'],
            wikidataId: 'Q1056588',
            creator: autore1._id,
            collaborators: [autore2._id],
            museumCenter: [44.4975, 11.3533],
            layers: [
                { id: 1, name: 'Piano Terra - Sezione Duecento e Rinascimento' },
                { id: 2, name: 'Primo Piano - Manierismo e Barocco' }
            ],
            lines: pinacotecaLines,
            areas: pinacotecaAreas,
            pois: pinacotecaPOIs
        });

        // 4. Creazione degli Item (con le varianti multi-livello e multi-durata)
        console.log('[Seed] Creazione Item multilivello e multilinguaggio...');
        
        const itemsData = [
            // BEDOLI - RITRATTO DI FRATE (L'opera delle slide con tutte le 4 combinazioni complete)
            {
                title: 'Ritratto di frate in veste di San Tommaso d\'Aquino',
                description: 'Ritratto di frate in veste di San Tommaso d’Aquino di Girolamo Mazzola Bedoli.',
                author: 'Girolamo Mazzola Bedoli',
                creator: 'autore1',
                style: 'Manierismo',
                artworkId: 'Q126599960',
                authorId: 'Q1527051',
                styleId: 'Q131808',
                length: '3s',
                languageLevel: 'medio',
                museumId: 'PIN-BO',
                museum: pinacoteca._id,
                poiId: 5007,
                license: 'CC-BY-SA',
                price: 0,
                recognitionImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Girolamo_Mazzola_Bedoli_-_San_Tommaso_d%27Aquino.jpg/400px-Girolamo_Mazzola_Bedoli_-_San_Tommaso_d%27Aquino.jpg'
            },
            {
                title: 'Ritratto di frate in veste di San Tommaso d\'Aquino',
                description: 'Un frate domenicano in un’atmosfera raccolta e severa. La figura, resa con forme allungate e toni freddi, riflette le caratteristiche tipiche del Manierismo, attento alla tensione interiore più che alla descrizione realistica.',
                author: 'Girolamo Mazzola Bedoli',
                creator: 'autore1',
                style: 'Manierismo',
                artworkId: 'Q126599960',
                authorId: 'Q1527051',
                styleId: 'Q131808',
                length: '15s',
                languageLevel: 'medio',
                museumId: 'PIN-BO',
                museum: pinacoteca._id,
                poiId: 5007,
                license: 'CC-BY-SA',
                price: 0,
                recognitionImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Girolamo_Mazzola_Bedoli_-_San_Tommaso_d%27Aquino.jpg/400px-Girolamo_Mazzola_Bedoli_-_San_Tommaso_d%27Aquino.jpg'
            },
            {
                title: 'Ritratto di frate in veste di San Tommaso d\'Aquino',
                description: 'Il quadro di Girolamo Mazzola Bedoli presenta un frate domenicano seduto al tavolo, immerso in uno spazio ridotto e definito da una luce fredda e selettiva. Lo stile è pienamente manierista: la figura appare leggermente allungata, con un modellato asciutto e un’espressività concentrata più su un ideale spirituale che su una resa fisiognomica precisa. I libri e il tavolo funzionano come elementi di inquadramento che guidano lo sguardo verso il volto, vero punto di tensione psicologica. La tavolozza limitata, dominata da bianchi gessosi e neri compatti, contribuisce a isolare la figura e a costruire un clima di disciplina intellettuale.',
                author: 'Girolamo Mazzola Bedoli',
                creator: 'autore1',
                style: 'Manierismo',
                artworkId: 'Q126599960',
                authorId: 'Q1527051',
                styleId: 'Q131808',
                length: '40s',
                languageLevel: 'medio',
                museumId: 'PIN-BO',
                museum: pinacoteca._id,
                poiId: 5007,
                license: 'CC-BY-SA',
                price: 0,
                recognitionImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Girolamo_Mazzola_Bedoli_-_San_Tommaso_d%27Aquino.jpg/400px-Girolamo_Mazzola_Bedoli_-_San_Tommaso_d%27Aquino.jpg'
            },
            {
                title: 'Ritratto di frate in veste di San Tommaso d\'Aquino',
                description: 'In questo quadro vediamo un frate seduto al suo tavolo, con tanti libri davanti. La stanza è calma e silenziosa, e una luce morbida illumina il suo volto, facendolo sembrare molto concentrato. I colori sono pochi e delicati: il bianco della veste e il nero del mantello creano un bel contrasto che attira subito lo sguardo. Il frate sembra immerso nei suoi pensieri, come se stesse studiando qualcosa di speciale da condividere con gli altri.',
                author: 'Girolamo Mazzola Bedoli',
                creator: 'autore1',
                style: 'Manierismo',
                artworkId: 'Q126599960',
                authorId: 'Q1527051',
                styleId: 'Q131808',
                length: '40s',
                languageLevel: 'infantile',
                museumId: 'PIN-BO',
                museum: pinacoteca._id,
                poiId: 5007,
                license: 'CC-BY-SA',
                price: 0,
                recognitionImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Girolamo_Mazzola_Bedoli_-_San_Tommaso_d%27Aquino.jpg/400px-Girolamo_Mazzola_Bedoli_-_San_Tommaso_d%27Aquino.jpg'
            },
            {
                title: 'Ritratto di frate in veste di San Tommaso d\'Aquino',
                description: 'Nel “Ritratto di frate in veste di San Tommaso d’Aquino”, Bedoli applica con coerenza i codici del manierismo emiliano, privilegiando un’elaborazione intellettuale della forma rispetto a una descrizione naturale. La figura, leggermente allungata e definita da un chiaroscuro metallico, è isolata da una tavolozza ristretta che integra bianchi gessosi e neri vellutati, tipici della sua produzione tarda. L’articolazione dello spazio è volutamente compressa: tavolo e libri non sono semplici attributi, ma elementi di disciplinamento visivo che incorniciano il volto, vero punto di densità semantica.',
                author: 'Girolamo Mazzola Bedoli',
                creator: 'autore1',
                style: 'Manierismo',
                artworkId: 'Q126599960',
                authorId: 'Q1527051',
                styleId: 'Q131808',
                length: '4min',
                languageLevel: 'specialistico',
                museumId: 'PIN-BO',
                museum: pinacoteca._id,
                poiId: 5007,
                license: 'CC-BY-SA',
                price: 0,
                recognitionImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Girolamo_Mazzola_Bedoli_-_San_Tommaso_d%27Aquino.jpg/400px-Girolamo_Mazzola_Bedoli_-_San_Tommaso_d%27Aquino.jpg'
            },

            // RAFFAELLO - ESTASI DI SANTA CECILIA
            {
                title: 'Estasi di santa Cecilia',
                description: 'Estasi di santa Cecilia di Raffaello Sanzio.',
                author: 'Raffaello Sanzio',
                creator: 'autore1',
                style: 'Alto Rinascimento',
                artworkId: 'Q2453886',
                authorId: 'Q5597',
                styleId: 'Q1474884',
                length: '3s',
                languageLevel: 'medio',
                museumId: 'PIN-BO',
                museum: pinacoteca._id,
                poiId: 5006,
                license: 'CC-BY-SA',
                price: 0,
                recognitionImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Raphael_-_The_Ecstasy_of_St._Cecilia.jpg/400px-Raphael_-_The_Ecstasy_of_St._Cecilia.jpg'
            },
            {
                title: 'Estasi di santa Cecilia',
                description: 'Capolavoro assoluto di Raffaello del 1514. La santa ascolta il coro celeste lasciando cadere gli strumenti musicali terreni, simbolo della musica mondana che cede il passo all\'armonia divina.',
                author: 'Raffaello Sanzio',
                creator: 'autore1',
                style: 'Alto Rinascimento',
                artworkId: 'Q2453886',
                authorId: 'Q5597',
                styleId: 'Q1474884',
                length: '15s',
                languageLevel: 'medio',
                museumId: 'PIN-BO',
                museum: pinacoteca._id,
                poiId: 5006,
                license: 'CC-BY-SA',
                price: 0,
                recognitionImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Raphael_-_The_Ecstasy_of_St._Cecilia.jpg/400px-Raphael_-_The_Ecstasy_of_St._Cecilia.jpg'
            },
            {
                title: 'Estasi di santa Cecilia',
                description: 'Commissionata per la cappella di Elena Duglioli dall\'Olio nella chiesa di San Giovanni in Monte, l\'opera rivoluzionò la pittura bolognese. Raffaello dispone santa Cecilia al centro, affiancata da San Paolo, San Giovanni Evangelista, Sant\'Agostino e Maria Maddalena. Ai piedi della santa giace una natura morta di strumenti musicali infranti, dipinta con magistrale perizia. Lo sguardo rapito verso il cielo esprime il rapimento mistico dell\'anima verso la luce spirituale.',
                author: 'Raffaello Sanzio',
                creator: 'autore1',
                style: 'Alto Rinascimento',
                artworkId: 'Q2453886',
                authorId: 'Q5597',
                styleId: 'Q1474884',
                length: '40s',
                languageLevel: 'medio',
                museumId: 'PIN-BO',
                museum: pinacoteca._id,
                poiId: 5006,
                license: 'CC-BY-SA',
                price: 0,
                recognitionImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Raphael_-_The_Ecstasy_of_St._Cecilia.jpg/400px-Raphael_-_The_Ecstasy_of_St._Cecilia.jpg'
            },

            // GUIDO RENI - STRAGE DEGLI INNOCENTI
            {
                title: 'Strage degli innocenti',
                description: 'Strage degli innocenti di Guido Reni.',
                author: 'Guido Reni',
                creator: 'autore1',
                style: 'Classicismo Barocco',
                artworkId: 'Q3824424',
                authorId: 'Q212304',
                styleId: 'Q37853',
                length: '3s',
                languageLevel: 'medio',
                museumId: 'PIN-BO',
                museum: pinacoteca._id,
                poiId: 5011,
                license: 'CC-BY-SA',
                price: 0,
                recognitionImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Guido_Reni_-_Massacre_of_the_Innocents_-_Google_Art_Project.jpg/400px-Guido_Reni_-_Massacre_of_the_Innocents_-_Google_Art_Project.jpg'
            },
            {
                title: 'Strage degli innocenti',
                description: 'Realizzata nel 1611 per la chiesa di San Domenico. Guido Reni sublima il dramma tragico dell\'eccidio in una composizione geometrica perfetta a triangolo rovesciato, unendo pathos emotivo e purezza classica.',
                author: 'Guido Reni',
                creator: 'autore1',
                style: 'Classicismo Barocco',
                artworkId: 'Q3824424',
                authorId: 'Q212304',
                styleId: 'Q37853',
                length: '15s',
                languageLevel: 'medio',
                museumId: 'PIN-BO',
                museum: pinacoteca._id,
                poiId: 5011,
                license: 'CC-BY-SA',
                price: 0,
                recognitionImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Guido_Reni_-_Massacre_of_the_Innocents_-_Google_Art_Project.jpg/400px-Guido_Reni_-_Massacre_of_the_Innocents_-_Google_Art_Project.jpg'
            },
            {
                title: 'Strage degli innocenti',
                description: 'In questo dipinto drammatico vediamo mamme coraggiose che proteggono i loro piccoli bambini. Anche se la storia è triste, il pittore ha usato colori luminosi e pose eleganti per ricordarci quanto è forte l\'amore di una mamma.',
                author: 'Guido Reni',
                creator: 'autore1',
                style: 'Classicismo Barocco',
                artworkId: 'Q3824424',
                authorId: 'Q212304',
                styleId: 'Q37853',
                length: '40s',
                languageLevel: 'infantile',
                museumId: 'PIN-BO',
                museum: pinacoteca._id,
                poiId: 5011,
                license: 'CC-BY-SA',
                price: 0,
                recognitionImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Guido_Reni_-_Massacre_of_the_Innocents_-_Google_Art_Project.jpg/400px-Guido_Reni_-_Massacre_of_the_Innocents_-_Google_Art_Project.jpg'
            },

            // PARMIGIANINO - MADONNA DI SANTA MARGHERITA
            {
                title: 'Madonna di Santa Margherita',
                description: 'Madonna con il Bambino e i santi Margherita, Girolamo e Petronio del Parmigianino, 1530.',
                author: 'Parmigianino',
                creator: 'autore2',
                style: 'Manierismo',
                artworkId: 'Q3842416',
                authorId: 'Q9348',
                styleId: 'Q131808',
                length: '15s',
                languageLevel: 'medio',
                museumId: 'PIN-BO',
                museum: pinacoteca._id,
                poiId: 5008,
                license: 'CC-BY-SA',
                price: 0,
                recognitionImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Parmigianino_-_Pala_di_Santa_Margherita.jpg/400px-Parmigianino_-_Pala_di_Santa_Margherita.jpg'
            },

            // ANNIBALE CARRACCI - ASSUNZIONE DELLA VERGINE
            {
                title: 'Assunzione della Vergine',
                description: 'Pala d\'altare del 1592. Annibale Carracci rompe la rigidità manierista introducendo corpi vibranti, luce naturale ed espressioni di autentico stupore tra gli apostoli attorno al sepolcro vuoto.',
                author: 'Annibale Carracci',
                creator: 'autore2',
                style: 'Barocco',
                artworkId: 'Q3627389',
                authorId: 'Q7824',
                styleId: 'Q37853',
                length: '15s',
                languageLevel: 'medio',
                museumId: 'PIN-BO',
                museum: pinacoteca._id,
                poiId: 5009,
                license: 'CC-BY-SA',
                price: 0,
                recognitionImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Annibale_Carracci_-_Assunzione_della_Vergine_-_Bologna.jpg/400px-Annibale_Carracci_-_Assunzione_della_Vergine_-_Bologna.jpg'
            },

            // PERUGINO - MADONNA IN GLORIA E SANTI
            {
                title: 'Madonna in gloria e santi',
                description: 'Eseguita nel 1500 circa per la chiesa di San Giovanni in Monte. Mostra la Madonna col Bambino in una mandorla di cherubini sopra quattro santi disposti con simmetrica dolcezza e maestosità.',
                author: 'Pietro Perugino',
                creator: 'autore1',
                style: 'Rinascimento umbro',
                artworkId: 'Q3842426',
                authorId: 'Q5827',
                styleId: 'Q1474884',
                length: '15s',
                languageLevel: 'medio',
                museumId: 'PIN-BO',
                museum: pinacoteca._id,
                poiId: 5005,
                license: 'CC-BY-SA',
                price: 0,
                recognitionImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Perugino%2C_Pala_di_san_giovanni_in_monte.jpg/400px-Perugino%2C_Pala_di_san_giovanni_in_monte.jpg'
            },

            // LUDOVICO CARRACCI - ANNUNCIAZIONE
            {
                title: 'Annunciazione',
                description: 'Dipinta nel 1584, quest\'opera giovanile di Ludovico Carracci stupisce per la sua intagliata semplicità domestica, dove l\'Arcangelo Gabriele entra con ali piumate in una sobria stanza da letto.',
                author: 'Ludovico Carracci',
                creator: 'autore2',
                style: 'Barocco',
                artworkId: 'Q3618174',
                authorId: 'Q380553',
                styleId: 'Q37853',
                length: '15s',
                languageLevel: 'medio',
                museumId: 'PIN-BO',
                museum: pinacoteca._id,
                poiId: 5010,
                license: 'CC-BY-SA',
                price: 0,
                recognitionImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Ludovico_Carracci_-_Annunciazione_-_Pinacoteca_Bologna.jpg/400px-Ludovico_Carracci_-_Annunciazione_-_Pinacoteca_Bologna.jpg'
            },

            // GUERCINO - SAN SEBASTIANO SOCCORSO DA IRENE
            {
                title: 'San Sebastiano soccorso da Irene',
                description: 'Capolavoro del 1619. Guercino usa una luce radente e contrastata per scolpire il corpo sofferente del martire e la pietà amorevole di Sant\'Irene che estrae con delicatezza le frecce.',
                author: 'Guercino',
                creator: 'autore1',
                style: 'Barocco',
                artworkId: 'Q3947885',
                authorId: 'Q335016',
                styleId: 'Q37853',
                length: '15s',
                languageLevel: 'medio',
                museumId: 'PIN-BO',
                museum: pinacoteca._id,
                poiId: 5012,
                license: 'CC-BY-SA',
                price: 0,
                recognitionImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Guercino_-_San_Sebastiano_curato_da_Irene_-_Pinacoteca_Bologna.jpg/400px-Guercino_-_San_Sebastiano_curato_da_Irene_-_Pinacoteca_Bologna.jpg'
            },

            // GIOTTO - POLITTICO DI BOLOGNA
            {
                title: 'Polittico di Bologna',
                description: 'Firmato "Opus Magistri Iocti de Florentia", questo grandioso polittico a cinque scomparti venne dipinto per la chiesa di Santa Maria degli Angeli nel 1330 circa.',
                author: 'Giotto e bottega',
                creator: 'autore1',
                style: 'Pittura Gotica',
                artworkId: 'Q3907519',
                authorId: 'Q7814',
                styleId: 'Q1474884',
                length: '15s',
                languageLevel: 'medio',
                museumId: 'PIN-BO',
                museum: pinacoteca._id,
                poiId: 5001,
                license: 'CC-BY-SA',
                price: 0,
                recognitionImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Giotto_di_Bondone_-_Polittico_di_Bologna_-_Google_Art_Project.jpg/400px-Giotto_di_Bondone_-_Polittico_di_Bologna_-_Google_Art_Project.jpg'
            },

            // VITALE DA BOLOGNA - SAN GIORGIO E IL DRAGO
            {
                title: 'San Giorgio e il drago',
                description: 'Tavola del 1335-1340. San Giorgio in sella a un cavallo impennato trafigge il drago con straordinaria energia dinamica e gestualità vibrante tipica della scuola bolognese trecentesca.',
                author: 'Vitale da Bologna',
                creator: 'autore2',
                style: 'Gotico Bolognese',
                artworkId: 'Q3947230',
                authorId: 'Q979603',
                styleId: 'Q1474884',
                length: '15s',
                languageLevel: 'medio',
                museumId: 'PIN-BO',
                museum: pinacoteca._id,
                poiId: 5002,
                license: 'CC-BY-SA',
                price: 0,
                recognitionImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Vitale_da_Bologna_-_San_Giorgio_e_il_drago.jpg/400px-Vitale_da_Bologna_-_San_Giorgio_e_il_drago.jpg'
            },
            {
                title: 'San Giorgio e il drago',
                description: 'Guardate come il cavaliere San Giorgio salta con il suo bianco destriero per sconfiggere il terribile drago con le ali! Salva la principessa e riporta la pace in tutto il regno!',
                author: 'Vitale da Bologna',
                creator: 'autore2',
                style: 'Gotico Bolognese',
                artworkId: 'Q3947230',
                authorId: 'Q979603',
                styleId: 'Q1474884',
                length: '15s',
                languageLevel: 'infantile',
                museumId: 'PIN-BO',
                museum: pinacoteca._id,
                poiId: 5002,
                license: 'CC-BY-SA',
                price: 0,
                recognitionImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Vitale_da_Bologna_-_San_Giorgio_e_il_drago.jpg/400px-Vitale_da_Bologna_-_San_Giorgio_e_il_drago.jpg'
            },

            // LORENZO COSTA - MATRIMONIO MISTICO DI SANTA CATERINA
            {
                title: 'Matrimonio mistico di santa Caterina',
                description: 'Dipinto attorno al 1505 da Lorenzo Costa. Atmosfera intima e dolcezza leonardesca nei volti e nelle sfumature dei panneggi rinascimentali.',
                author: 'Lorenzo Costa',
                creator: 'autore1',
                style: 'Rinascimento',
                artworkId: 'Q11500002',
                authorId: 'Q709848',
                styleId: 'Q1474884',
                length: '15s',
                languageLevel: 'medio',
                museumId: 'PIN-BO',
                museum: pinacoteca._id,
                poiId: 5004,
                license: 'CC-BY-SA',
                price: 0,
                recognitionImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Lorenzo_Costa_-_Matrimonio_mistico_di_santa_caterina.jpg/400px-Lorenzo_Costa_-_Matrimonio_mistico_di_santa_caterina.jpg'
            },

            // FRANCESCO FRANCIA - PALA FELICINI
            {
                title: 'Pala Felicini',
                description: 'Eseguita nel 1494 da Francesco Francia per la cappella Felicini nella chiesa di Santa Maria della Misericordia. Prospettiva calibrata e chiaroscuri morbidi di gusto peruginesco.',
                author: 'Francesco Francia',
                creator: 'autore2',
                style: 'Rinascimento',
                artworkId: 'Q11500001',
                authorId: 'Q451368',
                styleId: 'Q1474884',
                length: '15s',
                languageLevel: 'medio',
                museumId: 'PIN-BO',
                museum: pinacoteca._id,
                poiId: 5003,
                license: 'CC-BY-SA',
                price: 0,
                recognitionImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Francesco_Francia_-_Pala_Felicini.jpg/400px-Francesco_Francia_-_Pala_Felicini.jpg'
            }
        ];

        const createdItems = await Item.create(itemsData);
        console.log(`[Seed] Creati ${createdItems.length} item nel database.`);

        // Mappa helper per recuperare gli ID degli item creati per POI
        const getItemByPoi = (poiId, level = 'medio', length = '15s') => {
            const found = createdItems.find(it => it.poiId === poiId && it.languageLevel === level && it.length === length);
            if (found) return found;
            return createdItems.find(it => it.poiId === poiId) || createdItems[0];
        };

        // 5. Creazione delle 3 Visite Obbligatorie (da >= 10 opere ciascuna) con Step Logistici
        console.log('[Seed] Creazione delle 3 visite complete con >=10 opere + step logistici...');

        // VISITA 1: I Grandi Capolavori della Pinacoteca (Tono Medio, 10 Opere)
        const visit1Items = [
            getItemByPoi(5001, 'medio', '15s'), // Giotto
            getItemByPoi(5002, 'medio', '15s'), // Vitale da Bologna
            getItemByPoi(5003, 'medio', '15s'), // Francesco Francia
            getItemByPoi(5004, 'medio', '15s'), // Lorenzo Costa
            getItemByPoi(5005, 'medio', '15s'), // Perugino
            getItemByPoi(5006, 'medio', '15s'), // Raffaello
            getItemByPoi(5007, 'medio', '15s'), // Bedoli
            getItemByPoi(5008, 'medio', '15s'), // Parmigianino
            getItemByPoi(5009, 'medio', '15s'), // Annibale Carracci
            getItemByPoi(5011, 'medio', '15s')  // Guido Reni
        ];

        const visit1Steps = [
            { order: 1, stepType: 'logistica', logisticsText: 'Benvenuti alla Pinacoteca Nazionale di Bologna. Dopo i tornelli d\'ingresso, svoltate a sinistra per accedere alla Sala 1 dei Primitivi.', targetPoiId: 4001, roomName: 'Atrio d\'Ingresso' },
            { order: 2, stepType: 'item', itemId: visit1Items[0]._id, targetPoiId: 5001, roomName: 'Sala 1 - Trecento' },
            { order: 3, stepType: 'logistica', logisticsText: 'Avanzate di pochi passi sulla parete di fronte per ammirare il celebre cavaliere di Vitale da Bologna.', targetPoiId: 5002, roomName: 'Sala 1 - Trecento' },
            { order: 4, stepType: 'item', itemId: visit1Items[1]._id, targetPoiId: 5002, roomName: 'Sala 1 - Trecento' },
            { order: 5, stepType: 'logistica', logisticsText: 'Proseguite dritto attraverso l\'arco verso la Sala del Rinascimento bolognese.', targetPoiId: 5003, roomName: 'Sala 2 - Rinascimento' },
            { order: 6, stepType: 'item', itemId: visit1Items[2]._id, targetPoiId: 5003, roomName: 'Sala 2 - Rinascimento' },
            { order: 7, stepType: 'item', itemId: visit1Items[3]._id, targetPoiId: 5004, roomName: 'Sala 2 - Rinascimento' },
            { order: 8, stepType: 'logistica', logisticsText: 'Entrate nella Sala 3 dedicata ai maestri dell\'Italia centrale, Perugino e Raffaello.', targetPoiId: 5005, roomName: 'Sala 3 - Raffaello' },
            { order: 9, stepType: 'item', itemId: visit1Items[4]._id, targetPoiId: 5005, roomName: 'Sala 3 - Raffaello' },
            { order: 10, stepType: 'item', itemId: visit1Items[5]._id, targetPoiId: 5006, roomName: 'Sala 3 - Raffaello' },
            { order: 11, stepType: 'logistica', logisticsText: 'Prendete le scale o l\'ascensore alla vostra destra per salire al Primo Piano nella Sezione Manierismo e Barocco.', targetPoiId: 4005, roomName: 'Collegamento Piani' },
            { order: 12, stepType: 'item', itemId: visit1Items[6]._id, targetPoiId: 5007, roomName: 'Sala 4 - Manierismo' },
            { order: 13, stepType: 'item', itemId: visit1Items[7]._id, targetPoiId: 5008, roomName: 'Sala 4 - Manierismo' },
            { order: 14, stepType: 'logistica', logisticsText: 'Svoltate a destra verso il grandioso salone dedicato alla scuola dei Carracci e al Seicento.', targetPoiId: 5009, roomName: 'Sala 5 - I Carracci' },
            { order: 15, stepType: 'item', itemId: visit1Items[8]._id, targetPoiId: 5009, roomName: 'Sala 5 - I Carracci' },
            { order: 16, stepType: 'logistica', logisticsText: 'Infine, al centro della sala successiva, ammirate il capolavoro monumentale di Guido Reni.', targetPoiId: 5011, roomName: 'Sala 6 - Guido Reni' },
            { order: 17, stepType: 'item', itemId: visit1Items[9]._id, targetPoiId: 5011, roomName: 'Sala 6 - Guido Reni' }
        ];

        const visit1 = await Visit.create({
            title: 'I Grandi Capolavori della Pinacoteca',
            description: 'Il percorso fondamentale per scoprire le 10 opere più celebri della collezione: dal Trecento dorato di Giotto e Vitale, al Rinascimento di Raffaello, fino alla magnificenza barocca di Guido Reni.',
            museum: pinacoteca._id,
            museumId: 'PIN-BO',
            price: 0,
            duration: 60,
            knowledgeLevel: 'medio',
            targetAudience: 'Tutti i visitatori',
            status: 'published',
            author: autore1._id,
            image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&q=80&w=800',
            steps: visit1Steps,
            items: visit1Items.map(it => it._id)
        });

        // VISITA 2: Caccia all'Arte per Ragazzi (Tono Infantile / Ragazzi, 10 Opere)
        const visit2Items = [
            getItemByPoi(5002, 'infantile', '15s'), // Vitale da Bologna
            getItemByPoi(5001, 'medio', '15s'),
            getItemByPoi(5003, 'medio', '15s'),
            getItemByPoi(5004, 'medio', '15s'),
            getItemByPoi(5005, 'medio', '15s'),
            getItemByPoi(5006, 'medio', '15s'),
            getItemByPoi(5007, 'infantile', '40s'), // Bedoli infantile
            getItemByPoi(5008, 'medio', '15s'),
            getItemByPoi(5009, 'medio', '15s'),
            getItemByPoi(5011, 'infantile', '40s')  // Guido Reni infantile
        ];

        const visit2Steps = [
            { order: 1, stepType: 'logistica', logisticsText: 'Ciao esploratori! Pronti per la nostra caccia ai draghi e ai segreti dei dipinti? Entriamo nella prima stanza!', targetPoiId: 4001, roomName: 'Partenza' },
            { order: 2, stepType: 'item', itemId: visit2Items[0]._id, targetPoiId: 5002, roomName: 'Sala dei Cavalieri' },
            { order: 3, stepType: 'item', itemId: visit2Items[1]._id, targetPoiId: 5001, roomName: 'Sala dell\'Oro' },
            { order: 4, stepType: 'logistica', logisticsText: 'Camminiamo con passo felpato nella stanza successiva...', targetPoiId: 5003, roomName: 'Sala Rinascimento' },
            { order: 5, stepType: 'item', itemId: visit2Items[2]._id, targetPoiId: 5003, roomName: 'Sala Rinascimento' },
            { order: 6, stepType: 'item', itemId: visit2Items[3]._id, targetPoiId: 5004, roomName: 'Sala Rinascimento' },
            { order: 7, stepType: 'item', itemId: visit2Items[4]._id, targetPoiId: 5005, roomName: 'Sala della Musica' },
            { order: 8, stepType: 'item', itemId: visit2Items[5]._id, targetPoiId: 5006, roomName: 'Sala della Musica' },
            { order: 9, stepType: 'logistica', logisticsText: 'Saliamo al piano di sopra con l\'ascensore trasparente!', targetPoiId: 4005, roomName: 'Ascensore' },
            { order: 10, stepType: 'item', itemId: visit2Items[6]._id, targetPoiId: 5007, roomName: 'Sala dello Studioso' },
            { order: 11, stepType: 'item', itemId: visit2Items[7]._id, targetPoiId: 5008, roomName: 'Sala delle Meraviglie' },
            { order: 12, stepType: 'item', itemId: visit2Items[8]._id, targetPoiId: 5009, roomName: 'Sala dei Giganti' },
            { order: 13, stepType: 'item', itemId: visit2Items[9]._id, targetPoiId: 5011, roomName: 'Sala del Grande Coraggio' }
        ];

        const visit2 = await Visit.create({
            title: 'Caccia all\'Arte per Ragazzi: Draghi, Santi ed Eroi',
            description: 'Un viaggio avventuroso ed entusiasmante pensato per famiglie e bambini: scopriamo draghi alati, strumenti musicali misteriosi e personaggi straordinari spiegati con parole semplici e divertenti!',
            museum: pinacoteca._id,
            museumId: 'PIN-BO',
            price: 0,
            duration: 45,
            knowledgeLevel: 'infantile',
            targetAudience: 'Famiglie e Scuole',
            status: 'published',
            author: autore2._id,
            image: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&q=80&w=800',
            steps: visit2Steps,
            items: visit2Items.map(it => it._id)
        });

        // VISITA 3: Dal Manierismo al Barocco Emiliano (Tono Specialistico, 10 Opere)
        const visit3Items = [
            getItemByPoi(5006, 'medio', '15s'), // Raffaello
            getItemByPoi(5007, 'specialistico', '4min'), // Bedoli specialistico
            getItemByPoi(5008, 'medio', '15s'), // Parmigianino
            getItemByPoi(5009, 'medio', '15s'), // Annibale Carracci
            getItemByPoi(5010, 'medio', '15s'), // Ludovico Carracci
            getItemByPoi(5011, 'medio', '15s'), // Guido Reni
            getItemByPoi(5012, 'medio', '15s'), // Guercino
            getItemByPoi(5005, 'medio', '15s'), // Perugino
            getItemByPoi(5004, 'medio', '15s'), // Lorenzo Costa
            getItemByPoi(5003, 'medio', '15s')  // Francesco Francia
        ];

        const visit3Steps = [
            { order: 1, stepType: 'logistica', logisticsText: 'Iniziamo l\'itinerario monografico dalla Santa Cecilia di Raffaello, matrice formativa del classicismo emiliano.', targetPoiId: 5006, roomName: 'Sala 3 - Premesse Rinascimentali' },
            { order: 2, stepType: 'item', itemId: visit3Items[0]._id, targetPoiId: 5006, roomName: 'Sala 3 - Raffaello' },
            { order: 3, stepType: 'logistica', logisticsText: 'Saliamo al primo piano per immergerci nelle eleganze formali del Manierismo padano.', targetPoiId: 4005, roomName: 'Primo Piano' },
            { order: 4, stepType: 'item', itemId: visit3Items[1]._id, targetPoiId: 5007, roomName: 'Sala 4 - Bedoli' },
            { order: 5, stepType: 'item', itemId: visit3Items[2]._id, targetPoiId: 5008, roomName: 'Sala 4 - Parmigianino' },
            { order: 6, stepType: 'logistica', logisticsText: 'Passiamo alla riforma naturalistica dell\'Accademia degli Incamminati fondata dai Carracci.', targetPoiId: 5009, roomName: 'Sala 5 - I Carracci' },
            { order: 7, stepType: 'item', itemId: visit3Items[3]._id, targetPoiId: 5009, roomName: 'Sala 5 - Annibale Carracci' },
            { order: 8, stepType: 'item', itemId: visit3Items[4]._id, targetPoiId: 5010, roomName: 'Sala 5 - Ludovico Carracci' },
            { order: 9, stepType: 'logistica', logisticsText: 'Concludiamo l\'analisi con il contrasto tra il classicismo apollineo di Guido Reni e il luminismo drammatico di Guercino.', targetPoiId: 5011, roomName: 'Sala 6 - Il Seicento' },
            { order: 10, stepType: 'item', itemId: visit3Items[5]._id, targetPoiId: 5011, roomName: 'Sala 6 - Guido Reni' },
            { order: 11, stepType: 'item', itemId: visit3Items[6]._id, targetPoiId: 5012, roomName: 'Sala 6 - Guercino' },
            { order: 12, stepType: 'item', itemId: visit3Items[7]._id, targetPoiId: 5005, roomName: 'Sala 3' },
            { order: 13, stepType: 'item', itemId: visit3Items[8]._id, targetPoiId: 5004, roomName: 'Sala 2' },
            { order: 14, stepType: 'item', itemId: visit3Items[9]._id, targetPoiId: 5003, roomName: 'Sala 2' }
        ];

        const visit3 = await Visit.create({
            title: 'Dal Manierismo al Barocco Emiliano: Bedoli, Carracci e Guido Reni',
            description: 'Un percorso critico approfondito per studenti universitari e studiosi: l\'evoluzione stilistica dalla grazia manierista del Parmigianino e del Bedoli alla riforma naturalistica dei Carracci fino al classicismo di Guido Reni.',
            museum: pinacoteca._id,
            museumId: 'PIN-BO',
            price: 5,
            duration: 90,
            knowledgeLevel: 'specialistico',
            targetAudience: 'Studenti Universitari ed Esperti',
            status: 'published',
            author: autore1._id,
            image: 'https://images.unsplash.com/photo-1544211152-bd450893375c?auto=format&fit=crop&q=80&w=800',
            steps: visit3Steps,
            items: visit3Items.map(it => it._id)
        });

        // 6. VISITA 4 (Sincronizzata con Quiz per il Modulo 18-27)
        console.log('[Seed] Creazione visita sincronizzata ("Fenice rossa") con Quiz per docenti...');
        
        const syncVisit = await Visit.create({
            title: 'Visita Guidata Classe 4B - Liceo Artistico',
            description: 'Visita sincronizzata per gruppi scolastici e docenti con trasmissione audio condivisa negli auricolari e verifica finale delle competenze.',
            museum: pinacoteca._id,
            museumId: 'PIN-BO',
            price: 0,
            duration: 60,
            knowledgeLevel: 'medio',
            targetAudience: 'Scuole e Gruppi Guidati',
            status: 'published',
            author: docente1._id,
            isSync: true,
            mnemonicName: 'Fenice rossa',
            image: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&q=80&w=800',
            steps: visit1Steps,
            items: visit1Items.map(it => it._id)
        });

        // Quiz collegato alla visita sincronizzata
        const quizData = await Quiz.create({
            title: 'Test di Verifica - Capolavori della Pinacoteca',
            description: 'Quiz di valutazione delle competenze al termine della visita guidata "Fenice rossa".',
            visit: syncVisit._id,
            museum: pinacoteca._id,
            teacher: docente1._id,
            questions: [
                {
                    question: 'Nel dipinto di Girolamo Mazzola Bedoli, quale figura religiosa è ritratta?',
                    options: [
                        'Un frate in veste di San Tommaso d\'Aquino',
                        'San Francesco d\'Assisi con le stimmate',
                        'Papa Gregorio Magno nello studiolo',
                        'Sant\'Agostino che scrive la Regola'
                    ],
                    correctIndex: 0,
                    explanation: 'Bedoli ritrae un frate domenicano seduto con i libri, personificazione di San Tommaso d\'Aquino.',
                    points: 2
                },
                {
                    question: 'Cosa lasciano cadere ai loro piedi i personaggi nell\'Estasi di santa Cecilia di Raffaello?',
                    options: [
                        'Monete e gioielli preziosi',
                        'Strumenti musicali terreni infranti',
                        'Corone e scettri regali',
                        'Rotoli di pergamena'
                    ],
                    correctIndex: 1,
                    explanation: 'La musica celeste fa impallidire e cadere a terra gli strumenti musicali mondani.',
                    points: 2
                },
                {
                    question: 'Quale schema geometrico domina la monumentale "Strage degli innocenti" di Guido Reni?',
                    options: [
                        'Una spirale aurea',
                        'Una composizione piramidale a triangolo rovesciato',
                        'Un cerchio perfetto rinascimentale',
                        'Tre fasce orizzontali parallele'
                    ],
                    correctIndex: 1,
                    explanation: 'Guido Reni struttura le figure femminili e i carnefici secondo un calibrato schema piramidale inverso.',
                    points: 2
                },
                {
                    question: 'Quale animale fantastico sconfigge San Giorgio nella celebre tavola di Vitale da Bologna?',
                    options: [
                        'Un grifone dorato',
                        'Un drago alato e serpentino',
                        'Un leone di Nemea',
                        'Un basilisco'
                    ],
                    correctIndex: 1,
                    explanation: 'Vitale da Bologna raffigura il cavaliere su cavallo impennato mentre trafigge il drago.',
                    points: 2
                },
                {
                    question: 'Quale elemento stilistico caratterizza la Madonna di Santa Margherita del Parmigianino?',
                    options: [
                        'Proporzioni allungate e grazia sofisticata manierista',
                        'Realismo fiammingo crudo e dettagliato',
                        'Luminismo caravaggesco tenebroso',
                        'Rigida simmetria bizantina a fondo oro'
                    ],
                    correctIndex: 0,
                    explanation: 'Il Parmigianino è celebre per l\'allungamento elegante dei corpi e la delicatezza manierista.',
                    points: 2
                }
            ]
        });

        syncVisit.quiz = quizData._id;
        await syncVisit.save();

        console.log('[Seed] Seeding completato con successo!');
        console.log('----------------------------------------------------');
        console.log('Museo: Pinacoteca Nazionale di Bologna (PIN-BO)');
        console.log('Account creati: autore1, autore2, visitatore1, visitatore2, docente1 (pwd: 12345678)');
        console.log(`Visite create: 3 standard (${visit1.title}, ${visit2.title}, ${visit3.title}) + 1 sincronizzata (${syncVisit.title} - "${syncVisit.mnemonicName}")`);
        console.log(`Item totali: ${createdItems.length}`);
        console.log(`Quiz associato a visita sincrona: ${quizData.title}`);
        console.log('----------------------------------------------------');

        await mongoose.disconnect();
        process.exit(0);

    } catch (error) {
        console.error('[Seed Error] Errore durante il popolamento:', error);
        process.exit(1);
    }
};

seedDatabase();
