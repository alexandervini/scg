// app/api/gado/route.js
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL = "https://zvgehtwivjrtlplyjqbu.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2Z2VodHdpdmpydGxwbHlqcWJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3MzU4NDIsImV4cCI6MjA3ODMxMTg0Mn0.Pju7Jajk9yOebZSaZLmJGHVvGv_u89zAOPBzP4br0hA";
const supabase = createClient(supabaseUrl, supabaseKey);

// GET - Buscar todos os gados
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('gado')
      .select(`
        *,
        pai:pai_id (identificacao),
        mae:mae_id (identificacao)
      `)
      .order('id', { ascending: false });

    if (error) throw error;

    // Formatar os dados para corresponder ao formato esperado pelo frontend
    const formattedData = data.map(gado => ({
      ...gado,
      qualidade_extenso: 
        gado.qualidade === 'B' ? 'Bom' :
        gado.qualidade === 'N' ? 'Neutra' :
        gado.qualidade === 'R' ? 'Ruim' :
        'Desconhecido',
      pai_identificador: gado.pai?.identificacao || null,
      mae_identificador: gado.mae?.identificacao || null
    }));

    return NextResponse.json(formattedData);
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
      const { data: paiData, error: paiError } = await supabase
        .from('gado')
        .select('id, sexo')
        .eq('identificacao', pai_identificador)
        .single();
      
      if (paiError || !paiData) {
        return NextResponse.json({ 
          error: `Pai com identificação "${pai_identificador}" não encontrado no banco de dados` 
        }, { status: 400 });
      }
      
      if (paiData.sexo !== 'M') {
        return NextResponse.json({ 
          error: `O gado "${pai_identificador}" não pode ser pai pois não é macho (M)` 
        }, { status: 400 });
      }
      
      pai_id = paiData.id;
    }

    // Se foi informado identificador da mãe, buscar o ID e validar se é fêmea
    if (mae_identificador && mae_identificador.trim() !== '') {
      const { data: maeData, error: maeError } = await supabase
        .from('gado')
        .select('id, sexo')
        .eq('identificacao', mae_identificador)
        .single();
      
      if (maeError || !maeData) {
        return NextResponse.json({ 
          error: `Mãe com identificação "${mae_identificador}" não encontrada no banco de dados` 
        }, { status: 400 });
      }
      
      if (maeData.sexo !== 'F') {
        return NextResponse.json({ 
          error: `O gado "${mae_identificador}" não pode ser mãe pois não é fêmea (F)` 
        }, { status: 400 });
      }
      
      mae_id = maeData.id;
    }

    // Inserir o novo gado
    const { data: insertData, error: insertError } = await supabase
      .from('gado')
      .insert([{
        identificacao,
        sexo,
        raca,
        data_nascimento,
        qualidade,
        pai_id,
        mae_id,
        peso
      }])
      .select()
      .single();

    if (insertError) {
      // Verificar se é erro de duplicata
      if (insertError.code === '23505') {
        return NextResponse.json({ 
          error: 'Já existe um gado com essa identificação' 
        }, { status: 400 });
      }
      throw insertError;
    }

    // Buscar o gado criado com os dados completos
    const { data: fullData, error: fullError } = await supabase
      .from('gado')
      .select(`
        *,
        pai:pai_id (identificacao),
        mae:mae_id (identificacao)
      `)
      .eq('id', insertData.id)
      .single();

    if (fullError) throw fullError;

    // Formatar os dados
    const formattedData = {
      ...fullData,
      qualidade_extenso: 
        fullData.qualidade === 'B' ? 'Bom' :
        fullData.qualidade === 'N' ? 'Neutra' :
        fullData.qualidade === 'R' ? 'Ruim' :
        'Desconhecido',
      pai_identificador: fullData.pai?.identificacao || null,
      mae_identificador: fullData.mae?.identificacao || null
    };

    return NextResponse.json(formattedData, { status: 201 });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}