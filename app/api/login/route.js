import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// 1. Configuração do Cliente Supabase
// As variáveis de ambiente devem ser configuradas no seu projeto Next.js
// (ex: no arquivo .env.local)
const supabaseUrl = "https://zvgehtwivjrtlplyjqbu.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2Z2VodHdpdmpydGxwbHlqcWJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3MzU4NDIsImV4cCI6MjA3ODMxMTg0Mn0.Pju7Jajk9yOebZSaZLmJGHVvGv_u89zAOPBzP4br0hA"; // Chave de Serviço (Service Role Key)

const supabase = createClient(supabaseUrl, supabaseKey);

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

    // 2. Substituição da lógica de consulta PG por Supabase
    // A consulta direta ao banco de dados é feita com o método .from()
    const { data: user, error } = await supabase
      .from('usuario')
      .select('id, usuario')
      .eq('usuario', usuario)
      .eq('senha', senha) // ATENÇÃO: Armazenar senhas em texto puro é INSEGURO.
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 é o código para "nenhuma linha encontrada"
      console.error('Erro na consulta Supabase:', error);
      return NextResponse.json(
        { error: 'Erro ao processar login' },
        { status: 500 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário ou senha incorretos' },
        { status: 401 }
      );
    }

    // Usuário encontrado - gerar um token simples (mantendo a lógica original)
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
