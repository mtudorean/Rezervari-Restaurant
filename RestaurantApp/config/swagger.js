// config/swagger.js
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: { title: 'Restaurant API', version: '1.0.0' },
    servers: [{ url: 'http://localhost:3000' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
      }
    },
    paths: {
      '/api/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Înregistrare utilizator',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    nume:   { type: 'string', example: 'Ion Popescu' },
                    email:  { type: 'string', example: 'ion@test.com' },
                    parola: { type: 'string', example: 'parola123' }
                  }
                }
              }
            }
          },
          responses: { 201: { description: 'Cont creat' }, 409: { description: 'Email existent' } }
        }
      },
      '/api/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Autentificare',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    email:  { type: 'string' },
                    parola: { type: 'string' }
                  }
                }
              }
            }
          },
          responses: { 200: { description: 'Returnează JWT token' }, 401: { description: 'Credențiale greșite' } }
        }
      },
      '/api/auth/schimba-parola': {
        put: {
          tags: ['Auth'],
          summary: 'Schimbă parola',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    parola_actuala: { type: 'string' },
                    parola_noua:    { type: 'string' }
                  }
                }
              }
            }
          },
          responses: { 200: { description: 'Parolă schimbată' }, 401: { description: 'Parolă incorectă' } }
        }
      },
      '/api/meniu': {
        get: {
          tags: ['Meniu'],
          summary: 'Listă preparate (public)',
          responses: { 200: { description: 'Lista preparatelor' } }
        },
        post: {
          tags: ['Meniu'],
          summary: 'Adaugă preparat (admin)',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    denumire:  { type: 'string' },
                    descriere: { type: 'string' },
                    pret:      { type: 'number' },
                    categorie: { type: 'string' },
                    imagine:   { type: 'string' },
                    rating:    { type: 'number' }
                  }
                }
              }
            }
          },
          responses: { 201: { description: 'Preparat adăugat' } }
        }
      },
      '/api/meniu/{id}': {
        put: {
          tags: ['Meniu'],
          summary: 'Actualizează preparat (admin)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          requestBody: {
            content: {
              'application/json': {
                schema: { type: 'object', properties: { denumire: { type: 'string' }, pret: { type: 'number' }, este_disponibil: { type: 'boolean' } } }
              }
            }
          },
          responses: { 200: { description: 'Actualizat cu succes' } }
        },
        delete: {
          tags: ['Meniu'],
          summary: 'Șterge preparat (admin)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Eliminat din meniu' } }
        }
      },
      '/api/rezervari': {
        get: {
          tags: ['Rezervări'],
          summary: 'Toate rezervările (admin)',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Lista rezervărilor' } }
        },
        post: {
          tags: ['Rezervări'],
          summary: 'Creează rezervare',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    masa_id:    { type: 'integer' },
                    data:       { type: 'string', example: '2025-06-01' },
                    ora:        { type: 'string', example: '19:00' },
                    nr_persoane:{ type: 'integer' },
                    observatii: { type: 'string' }
                  }
                }
              }
            }
          },
          responses: { 201: { description: 'Rezervare creată' }, 409: { description: 'Masă ocupată' } }
        }
      },
      '/api/rezervari/ale-mele': {
        get: {
          tags: ['Rezervări'],
          summary: 'Rezervările mele',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Lista rezervărilor utilizatorului' } }
        }
      },
      '/api/rezervari/disponibile': {
        get: {
          tags: ['Rezervări'],
          summary: 'Mese disponibile',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'data', in: 'query', required: true, schema: { type: 'string', example: '2025-06-01' } },
            { name: 'ora',  in: 'query', required: true, schema: { type: 'string', example: '19:00' } }
          ],
          responses: { 200: { description: 'Lista meselor disponibile' } }
        }
      },
      '/api/rezervari/{id}': {
        delete: {
          tags: ['Rezervări'],
          summary: 'Anulează rezervare',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Rezervare anulată' } }
        }
      },
      '/api/rezervari/{id}/status': {
        put: {
          tags: ['Rezervări'],
          summary: 'Actualizează status rezervare (admin)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          requestBody: {
            content: {
              'application/json': {
                schema: { type: 'object', properties: { status: { type: 'string', enum: ['in_asteptare', 'confirmata', 'anulata'] } } }
              }
            }
          },
          responses: { 200: { description: 'Status actualizat' } }
        }
      },
      '/api/recenzii/{preparat_id}': {
        get: {
          tags: ['Recenzii'],
          summary: 'Recenzii pentru un preparat (public)',
          parameters: [{ name: 'preparat_id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Lista recenziilor' } }
        }
      },
      '/api/recenzii/poate-recenza/{preparat_id}': {
        get: {
          tags: ['Recenzii'],
          summary: 'Verifică dacă utilizatorul poate recenza',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'preparat_id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: '{ poateRecenza, aRecenzat }' } }
        }
      },
      '/api/recenzii': {
        post: {
          tags: ['Recenzii'],
          summary: 'Adaugă recenzie',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    preparat_id: { type: 'integer' },
                    calificativ: { type: 'integer', minimum: 1, maximum: 5 },
                    comentariu:  { type: 'string' }
                  }
                }
              }
            }
          },
          responses: { 201: { description: 'Recenzie adăugată' }, 403: { description: 'Fără rezervare confirmată' } }
        }
      },
      '/api/recenzii/{id}': {
        delete: {
          tags: ['Recenzii'],
          summary: 'Șterge recenzia proprie',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Recenzie ștearsă' } }
        }
      }
    }
  },
  apis: [] // gol — totul e definit mai sus
};

module.exports = swaggerJsdoc(options);