import { pool } from "./database.js";   

class LibroController {
    
    async getAll(req, res) {
        try {
            const [result] = await pool.query("SELECT * FROM libros");
            res.json(result);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Error al obtener los libros' });
        }
    }

    async getOne(req, res) {
        try {
            // Capturar el id de los parámetros de la ruta
            const { id } = req.params;
    
            // Realizar la consulta para obtener el libro con el id específico
            const [result] = await pool.query("SELECT * FROM libros WHERE id = ?", [id]);
    
            // Si no se encuentra el libro, responde con un 404
            if (result.length === 0) {
                return res.status(404).send('Libro no encontrado');
            }
    
            // Si se encuentra el libro, responde con el objeto del libro
            res.json(result[0]);
        } catch (err) {
            console.error(err);
            res.status(500).send('Error interno del servidor');
        }
    }
    

    async add(req, res) {
        try {
            // Verifica si el cuerpo de la solicitud es JSON válido
            if (!req.is('application/json')) {
                return res.status(400).json({ error: 'El cuerpo de la solicitud debe ser JSON' });
            }
    
            const { nombre, autor, categoria, "año-publicación": añoPublicacion, ISBN } = req.body;
    
            // Verifica los campos requeridos
            if (!nombre || !autor || !categoria || !añoPublicacion || !ISBN) {
                return res.status(400).json({ error: 'Faltan campos requeridos' });
            }
    
            // Validar formato de año-publicación (debe ser una fecha válida)
            if (isNaN(new Date(añoPublicacion).getTime())) {
                return res.status(400).json({ error: 'El campo año-publicación debe ser una fecha válida' });
            }
    
            // Validar formato de ISBN (debe tener 13 caracteres y solo dígitos)
            if (ISBN.length !== 13 || !/^\d+$/.test(ISBN)) {
                return res.status(400).json({ error: 'El campo ISBN debe tener 13 dígitos' });
            }
    
            // Verificar si se enviaron atributos extra no permitidos
            const allowedFields = ['nombre', 'autor', 'categoria', 'año-publicación', 'ISBN'];
            const extraFields = Object.keys(req.body).filter(key => !allowedFields.includes(key));
            if (extraFields.length > 0) {
                return res.status(400).json({ error: `Atributos no permitidos: ${extraFields.join(', ')}` });
            }
    
            // Insertar el nuevo libro en la base de datos
            const [result] = await pool.query(
                `INSERT INTO libros (nombre, autor, categoria, \`año-publicación\`, ISBN)
                VALUES (?, ?, ?, ?, ?)`,
                [nombre, autor, categoria, añoPublicacion, ISBN]
            );
            res.json({ "Libro Registrado": result.insertId });
    }
            catch (err) {
            console.error('Error en add:', err);
            res.status(500).json({ error: 'Error al registrar el libro' });
        }
    }
    

    
    async delete(req, res) {
        try {
            const { ISBN } = req.params;
    
            // Verificar si el libro con el ISBN existe
            const [bookExists] = await pool.query("SELECT id FROM libros WHERE ISBN = ?", [ISBN]);
            if (bookExists.length === 0) {
                return res.status(404).json({ error: 'Libro con el ISBN proporcionado no encontrado' });
            }
    
            // Eliminar el libro con el ISBN proporcionado
            const [result] = await pool.query("DELETE FROM libros WHERE ISBN = ?", [ISBN]);
    
            res.json({ "Registro ISBN Borrado": result.affectedRows });
    
        } catch (err) {
            console.error(err);
            res.status(500).send('Error interno del servidor');
        }
    }
    


    // async update(req, res) {

    //     try {
    //         // Verifica si el cuerpo de la solicitud es JSON válido
    //         if (!req.is('application/json')) {
    //             return res.status(400).json({ error: 'El cuerpo de la solicitud debe ser JSON' });
    //         }
    
    //         const { nombre, autor, categoria, "año-publicación": añoPublicacion, ISBN } = req.body;
    
    //         // Verifica los campos requeridos
    //         if (!nombre || !autor || !categoria || !añoPublicacion || !ISBN) {
    //             return res.status(400).json({ error: 'Faltan campos requeridos' });
    //         }
    
    //         // Validar formato de año-publicación (debe ser una fecha válida)
    //         if (isNaN(new Date(añoPublicacion).getTime())) {
    //             return res.status(400).json({ error: 'El campo año-publicación debe ser una fecha válida' });
    //         }
    
    //         // Validar formato de ISBN (debe tener 13 caracteres y solo dígitos)
    //         if (ISBN.length !== 13 || !/^\d+$/.test(ISBN)) {
    //             return res.status(400).json({ error: 'El campo ISBN debe tener 13 dígitos' });
    //         }
    
    //         // Verificar si se enviaron atributos extra no permitidos
    //         const allowedFields = ['nombre', 'autor', 'categoria', 'año-publicación', 'ISBN'];
    //         const extraFields = Object.keys(req.body).filter(key => !allowedFields.includes(key));
    //         if (extraFields.length > 0) {
    //             return res.status(400).json({ error: `Atributos no permitidos: ${extraFields.join(', ')}` });
    //         }
    
    //         // const libro = req.body;
    //         const [result] = await pool.query(
    //         `UPDATE libros SET nombre=?, autor=?, categoria=?, \`año-publicación\`=?, ISBN=? WHERE id=?`,
    //         [libro.nombre, libro.autor, libro.categoria, libro.añoPublicacion, libro.ISBN]
    //         );
    //         res.json({ "Biblioteca  actualizada": result.changedRows });
    //     }
    //     catch (err) {
    //     console.error('Error en add:', err);
    //     res.status(500).json({ error: 'Error al registrar el libro' });};

    // }    
    async update(req, res) {
        let connection;
        try {
            // Verifica si el cuerpo de la solicitud es JSON válido
            if (!req.is('application/json')) {
                return res.status(400).json({ error: 'El cuerpo de la solicitud debe ser JSON' });
            }
    
            const { nombre, autor, categoria, "año-publicación": añoPublicacion, ISBN, id } = req.body;
    
            // Verifica los campos requeridos
            if (!nombre || !autor || !categoria || !añoPublicacion || !ISBN || !id) {
                return res.status(400).json({ error: 'Faltan campos requeridos' });
            }
    
            // Validar formato de año-publicación (debe ser una fecha válida)
            if (isNaN(new Date(añoPublicacion).getTime())) {
                return res.status(400).json({ error: 'El campo año-publicación debe ser una fecha válida' });
            }
    
            // Validar formato de ISBN (debe tener 13 caracteres y solo dígitos)
            if (ISBN.length !== 13 || !/^\d+$/.test(ISBN)) {
                return res.status(400).json({ error: 'El campo ISBN debe tener 13 dígitos' });
            }
    
            // Verificar si se enviaron atributos extra no permitidos
            const allowedFields = ['nombre', 'autor', 'categoria', 'año-publicación', 'ISBN', 'id'];
            const extraFields = Object.keys(req.body).filter(key => !allowedFields.includes(key));
            if (extraFields.length > 0) {
                return res.status(400).json({ error: `Atributos no permitidos: ${extraFields.join(', ')}` });
            }
    
            connection = await pool.getConnection(); // Obtener la conexión de la pool
            const [result] = await connection.query(
                `UPDATE libros SET nombre=?, autor=?, categoria=?, \`año-publicación\`=?, ISBN=? WHERE id=?`,
                [nombre, autor, categoria, añoPublicacion, ISBN, id]
            );
    
            if (result.changedRows === 0) {
                return res.status(404).json({ error: 'No se encontró el libro para actualizar' });
            }
    
            res.json({ "Biblioteca actualizada": result.changedRows });
        } catch (err) {
            console.error('Error en update:', err);
            res.status(500).json({ error: 'Error al actualizar el libro' });
        } finally {
            if (connection) connection.release(); // Asegurar que la conexión se libere al final
        }
    }
    
}
export const libro = new LibroController();
