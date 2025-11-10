// Métodos implementados: GET, POST
import { Pool } from 'pg';
import { NextResponse } from 'next/server';

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: '25052003',
});

// GET - Buscar todos os gados
export async function GET() {
  try {
    const result = await pool.query(`
      SELECT 
        g.*, g.peso,
        CASE g.qualidade
          WHEN 'B' THEN 'Bom'
          WHEN 'N' THEN 'Neutra'
          WHEN 'R' THEN 'Ruim'
          WHEN 'D' THEN 'Desconhecido'
          ELSE 'Desconhecido'
        END as qualidade_extenso,
        p.identificacao as pai_identificador,
        m.identificacao as mae_identificador
      FROM gado g
      LEFT JOIN gado p ON g.pai_id = p.id
      LEFT JOIN gado m ON g.mae_id = m.id
      ORDER BY g.id DESC
    `);
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Criar novo gado
export async function POST(request) {
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
      `INSERT INTO gado (identificacao, sexo, raca, data_nascimento, qualidade, pai_id, mae_id, peso)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [identificacao, sexo, raca, data_nascimento, qualidade, pai_id, mae_id, peso]
    );
    
    const createdGado = result.rows[0];

    // Retorna o gado criado com os identificadores do pai/mãe e qualidade para o frontend
    const fullResult = await pool.query(`
        SELECT 
            g.*, g.peso,
            CASE g.qualidade
              WHEN 'B' THEN 'Bom'
              WHEN 'N' THEN 'Neutra'
              WHEN 'R' THEN 'Ruim'
              WHEN 'D' THEN 'Desconhecido'
              ELSE 'Desconhecido'
            END as qualidade_extenso,
            p.identificacao as pai_identificador,
            m.identificacao as mae_identificador
        FROM gado g
        LEFT JOIN gado p ON g.pai_id = p.id
        LEFT JOIN gado m ON g.mae_id = m.id
        WHERE g.id = $1
    `, [createdGado.id]);
    return NextResponse.json(fullResult.rows[0], { status: 201 });

  } catch (error) {
    if (error.code === '23505') { // Código de erro para violação de UNIQUE
      return NextResponse.json({ 
        error: 'Já existe um gado com essa identificação' 
      }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
