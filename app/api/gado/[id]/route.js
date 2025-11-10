
// Métodos implementados: PUT, DELETE
import { Pool } from 'pg';
import { NextResponse } from 'next/server';

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: '25052003',
});

// PUT - Atualizar um gado existente
export async function PUT(request, { params }) {
  const { id } = await params;
  try {
    const data = await request.json();
    const { identificacao, sexo, raca, data_nascimento, qualidade, pai_identificador, mae_identificador } = data;
    const peso = data.peso && data.peso.toString().trim() !== '' ? data.peso : null;

    let pai_id = null;
    let mae_id = null;

    // Se foi informado identificador do pai, buscar o ID e validar se é macho
    if (pai_identificador && pai_identificador.trim() !== '') {
      const paiResult = await pool.query(
        'SELECT id, sexo FROM gado WHERE identificacao = $1',
        [pai_identificador]
      );
      
      if (paiResult.rows.length === 0) {
        return NextResponse.json({ 
          error: `Pai com identificação "${pai_identificador}" não encontrado no banco de dados` 
        }, { status: 400 });
      }
      
      if (paiResult.rows[0].sexo !== 'M') {
        return NextResponse.json({ 
          error: `O gado "${pai_identificador}" não pode ser pai pois não é macho (M)` 
        }, { status: 400 });
      }
      
      pai_id = paiResult.rows[0].id;
    }

    // Se foi informado identificador da mãe, buscar o ID e validar se é fêmea
    if (mae_identificador && mae_identificador.trim() !== '') {
      const maeResult = await pool.query(
        'SELECT id, sexo FROM gado WHERE identificacao = $1',
        [mae_identificador]
      );
      
      if (maeResult.rows.length === 0) {
        return NextResponse.json({ 
          error: `Mãe com identificação "${mae_identificador}" não encontrada no banco de dados` 
        }, { status: 400 });
      }
      
      if (maeResult.rows[0].sexo !== 'F') {
        return NextResponse.json({ 
          error: `O gado "${mae_identificador}" não pode ser mãe pois não é fêmea (F)` 
        }, { status: 400 });
      }
      
      mae_id = maeResult.rows[0].id;
    }

    const result = await pool.query(
      `UPDATE gado 
       SET identificacao = $1, sexo = $2, raca = $3, data_nascimento = $4, qualidade = $5, pai_id = $6, mae_id = $7, peso = $8
       WHERE id = $9 RETURNING *`,
      [identificacao, sexo, raca, data_nascimento, qualidade, pai_id, mae_id, peso, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Gado não encontrado' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);

  } catch (error) {
    if (error.code === '23505') { // Código de erro para violação de UNIQUE
      return NextResponse.json({ 
        error: 'Já existe um gado com essa identificação' 
      }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Deletar um gado
export async function DELETE(request, { params }) {
  const { id } = await params;
  try {
    const result = await pool.query('DELETE FROM gado WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Gado não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Gado deletado com sucesso' });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
