const express = require('express');
const cors = require('cors');
const axios = require('axios');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Configuración para subir archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Endpoint para buscar empresas por NIT - VERSIÓN CORREGIDA
app.get('/api/search-accounts', (req, res) => {
  try {
    const { nit } = req.query;
    console.log('🔍 Buscando empresas con NIT:', nit);
    
    if (!nit || nit.length < 2) {
      return res.json([]);
    }

    // Datos de EJEMPLO - con validación de propiedades
    const empresasEjemplo = [
      { 
        id: '1', 
        nit: '123456789', 
        nombre: 'EMPRESA EJEMPLO UNO S.A.S.', 
        direccion: 'Carrera 50 # 100-20' 
      },
      { 
        id: '2', 
        nit: '987654321', 
        nombre: 'COMERCIAL SANTAFE LTDA', 
        direccion: 'Avenida Circunvalar # 45-67' 
      },
      { 
        id: '3', 
        nit: '456123789', 
        nombre: 'INVERSIONES COLOMBIA S.A.', 
        direccion: 'Calle 80 # 12-34' 
      }
    ];
    
    // Filtrar empresas con validación SEGURA
    const empresasFiltradas = empresasEjemplo.filter(empresa => {
      // Verificar que la empresa tenga todas las propiedades necesarias
      if (!empresa.nit || !empresa.nombre) {
        console.log('⚠️ Empresa con datos incompletos:', empresa);
        return false;
      }
      
      const nitEmpresa = empresa.nit.toString();
      const nombreEmpresa = (empresa.nombre || '').toString().toLowerCase();
      const nitBusqueda = nit.toLowerCase();
      
      return nitEmpresa.includes(nitBusqueda) || 
             nombreEmpresa.includes(nitBusqueda);
    });
    
    console.log('✅ Empresas encontradas:', empresasFiltradas.length);
    res.json(empresasFiltradas);
    
  } catch (error) {
    console.error('❌ Error buscando empresas:', error);
    res.status(500).json({ error: 'Error buscando empresas' });
  }
});

// Endpoint para crear el ticket
app.post('/api/create-ticket', upload.array('archivos', 5), async (req, res) => {
  try {
    console.log('📨 DATOS RECIBIDOS DEL FORMULARIO:');
    console.log('====================================');
    
    // Mostrar todos los campos recibidos
    console.log('Cuerpo de la petición:', req.body);
    
    const {
      nombres,
      apellidos,
      contact_number,
      email,
      company_nit,
      selected_account_id,
      address,
      zone,
      warehouse_number,
      repair_area,
      description,
      terms
    } = req.body;

    console.log('selected_account_id:', selected_account_id);
    console.log('terms:', terms);

    // Validación ESPECÍFICA del campo selected_account_id
    if (!selected_account_id || selected_account_id === '') {
      console.log('❌ ERROR: selected_account_id está vacío');
      return res.status(400).json({ 
        success: false, 
        error: 'Debe seleccionar una empresa válida de la lista' 
      });
    }

    console.log('✅ selected_account_id recibido:', selected_account_id);

    if (!terms || terms === 'false') {
      return res.status(400).json({ 
        success: false, 
        error: 'Debe aceptar los términos y condiciones' 
      });
    }

    // Simulamos la creación exitosa del ticket
    const ticketId = 'TICKET_' + Date.now();
    
    console.log('🎫 Ticket creado exitosamente:', ticketId);
    
    res.json({ 
      success: true, 
      ticketId: ticketId,
      message: 'Solicitud enviada exitosamente. Nos contactaremos pronto.' 
    });
    
  } catch (error) {
    console.error('❌ Error en create-ticket:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor: ' + error.message 
    });
  }
});

// Endpoint de salud para verificar que el servidor funciona
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📋 Formulario disponible en http://localhost:${PORT}`);
  console.log(`🔍 API de búsqueda en http://localhost:${PORT}/api/search-accounts`);
  console.log(`🎫 API de tickets en http://localhost:${PORT}/api/create-ticket`);
});
