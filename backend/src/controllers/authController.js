const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db/connection');

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Nome, email e senha são obrigatórios.'
      });
    }

    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        message: 'Este email já está cadastrado.'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (name, email, password)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, created_at`,
      [name, email, hashedPassword]
    );

    return res.status(201).json({
      message: 'Usuário cadastrado com sucesso.',
      user: result.rows[0]
    });

  } catch (error) {
    console.error('Erro no cadastro:', error);

    return res.status(500).json({
      message: 'Erro interno do servidor.'
    });
  }
};


const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Verifica se os campos foram enviados
    if (!email || !password) {
      return res.status(400).json({
        message: 'Email e senha são obrigatórios.'
      });
    }

    // Procura o usuário pelo email
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: 'Email ou senha inválidos.'
      });
    }

    const user = result.rows[0];

    // Compara a senha enviada com a senha criptografada
    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: 'Email ou senha inválidos.'
      });
    }

    // Gera o token JWT
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '7d'
      }
    );

    return res.status(200).json({
      message: 'Login realizado com sucesso.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Erro no login:', error);

    return res.status(500).json({
      message: 'Erro interno do servidor.'
    });
  }
};


module.exports = {
  register,
  login
};