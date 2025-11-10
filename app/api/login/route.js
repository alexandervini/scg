import { Pool } from 'pg';
import { NextResponse } from 'next/server';

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: '25052003',
});

// SOMENTE POST
export async function POST(request) {
  try {
    const { usuario, senha } = await request.json();

    if (!usuario || !senha) {
      return NextResponse.json(
        { error: 'Usuário e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Buscar usuário no banco de dados
    const result = await pool.query(
      'SELECT id, usuario FROM usuario WHERE usuario = $1 AND senha = $2',
      [usuario, senha]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Usuário ou senha incorretos' },
        { status: 401 }
      );
    }

    // Usuário encontrado - gerar um token simples
    const user = result.rows[0];
    const token = Buffer.from(`${user.id}:${user.usuario}`).toString('base64');

    return NextResponse.json(
      { token, message: 'Login realizado com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro no login:', error);
    return NextResponse.json(
      { error: 'Erro ao processar login' },
      { status: 500 }
    );
  }
}
