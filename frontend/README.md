🏪 Sistema de Gestión - Librería
📖 Descripción General
El Sistema de Gestión - Librería es una aplicación web desarrollada para optimizar la administración de una librería, permitiendo el control integral de productos, categorías, clientes, proveedores, ventas y usuarios. Su objetivo es digitalizar los procesos internos y ofrecer una interfaz moderna, intuitiva y segura.
El sistema cuenta con una arquitectura cliente-servidor, donde el frontend está desarrollado con React.js y el backend con Node.js y Express, conectados a una base de datos relacional mediante un ORM.

🧩 Arquitectura del Sistema
📁 Libreria-Fabri/
 ├── 📁 backend/       → API REST desarrollada en Node.js + Express
 │   ├── 📁 src/
 │   │   ├── 📁 config/          → Configuración de base de datos y variables de entorno
 │   │   ├── 📁 controllers/     → Lógica de negocio y manejo de peticiones
 │   │   ├── 📁 middlewares/     → Validaciones y control de autenticación
 │   │   ├── 📁 models/          → Modelos de datos (ORM)
 │   │   ├── 📁 routes/          → Definición de rutas y endpoints
 │   │   └── server.js           → Punto de entrada del servidor backend
 │   ├── .env                    → Variables de entorno (credenciales BD, puerto, etc.)
 │   ├── package.json            → Dependencias y scripts de Node.js
 │   └── ...
 │
 └── 📁 frontend/      → Interfaz de usuario creada con React.js
     ├── 📁 src/
     │   ├── 📁 components/      → Componentes reutilizables (formularios, tablas, etc.)
     │   ├── 📁 pages/           → Páginas principales del sistema (Clientes, Ventas, etc.)
     │   ├── 📁 services/        → Conexión con la API backend mediante Axios
     │   └── main.jsx           → Punto de entrada de la aplicación React
     ├── package.json            → Dependencias del frontend
     └── vite.config.js          → Configuración del entorno Vite

⚙️ Tecnologías Utilizadas
Backend
    • Node.js (entorno de ejecución)
    • Express.js (framework backend)
    • MySQL / MariaDB (base de datos relacional)
    • Sequelize (ORM para conexión con la base de datos)
    • JWT (JSON Web Token) (autenticación de usuarios)
    • bcrypt (encriptación de contraseñas)
Frontend
    • React.js (librería para la interfaz de usuario)
    • Vite (entorno de desarrollo rápido)
    • Axios (cliente HTTP para consumir la API)
    • React Router DOM (navegación entre páginas)
    • Bootstrap / CSS Modules (estilos y diseño visual)

🔧 Instalación y Configuración
1️⃣ Clonar el Repositorio
git clone https://github.com/usuario/Libreria-Fabri.git
cd Libreria-Fabri
2️⃣ Configurar el Backend
cd backend
npm install
Crear archivo .env con las siguientes variables:
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=libreria_db
DB_DIALECT=mysql
PORT=4000
JWT_SECRET=clave_secreta_segura
Ejecutar el servidor:
npm start
El backend se ejecutará por defecto en http://localhost:4000.
3️⃣ Configurar el Frontend
cd ../frontend
npm install
npm run dev
El frontend se ejecutará por defecto en http://localhost:5173.

🗄️ Base de Datos
El sistema utiliza una base de datos relacional con las siguientes entidades principales:
    • Usuarios: manejo de credenciales y roles (administrador / empleado)
    • Productos: registro de libros y artículos con su stock y categoría
    • Categorías: clasificación de productos
    • Clientes: información de los clientes de la librería
    • Proveedores: registro de proveedores asociados
    • Ventas: registro de transacciones realizadas
    • DetalleVenta: tabla intermedia que relaciona ventas con productos
Las relaciones entre tablas se gestionan mediante Sequelize, aplicando claves foráneas y asociaciones (hasMany, belongsTo).

📡 Endpoints Principales (Backend)
Módulo
Método
Endpoint
Descripción
Autenticación
POST
/api/auth/login
Inicia sesión y devuelve token JWT
Usuarios
GET
/api/users
Lista todos los usuarios
Productos
GET
/api/products
Obtiene todos los productos
Productos
POST
/api/products
Crea un nuevo producto
Clientes
GET
/api/clients
Lista los clientes registrados
Ventas
POST
/api/sales
Registra una nueva venta
Cada endpoint se encuentra protegido por middlewares de autenticación y validaciones de datos.

🧠 Funcionalidades Principales
    • Gestión de productos: alta, baja, modificación y búsqueda por categoría.
    • Gestión de clientes y proveedores.
    • Registro de ventas con cálculo de totales.
    • Autenticación de usuarios mediante JWT.
    • Interfaz responsive desarrollada en React.
    • Comunicación entre frontend y backend mediante API REST.

🧑‍💻 Autores
    • Franco Vieytes

    • Fabrizzio Zito

    • Lisandro López

    • Matías Ochoa

📅 Versión y Licencia
Versión: 1.0.0
Licencia: Uso académico y educativo.

🧾 Conclusión
El Sistema de Gestión - Librería constituye una solución completa para la administración de una librería moderna, integrando un backend robusto, una interfaz dinámica y una estructura escalable. Este proyecto demuestra la aplicación práctica de tecnologías web actuales para resolver problemáticas reales de gestión comercial.