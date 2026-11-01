
import Link from "next/link";

const secoes = [
  {
    titulo: "1. Apresentação e aceitação",
    paragrafos: [
      "A AuraMeets é uma plataforma digital destinada a conectar pessoas interessadas em autoconhecimento, bem-estar e desenvolvimento pessoal a profissionais que oferecem terapias, práticas integrativas, orientações, consultas, cursos e outros serviços.",
      "Ao acessar, cadastrar-se ou utilizar a AuraMeets, o usuário declara ter lido e compreendido estes Termos de Uso e concorda em respeitá-los, juntamente com a Política de Privacidade.",
      "Determinadas funcionalidades poderão exigir cadastro, confirmação de informações ou aceitação de condições comerciais específicas.",
    ],
  },
  {
    titulo: "2. Natureza da plataforma",
    paragrafos: [
      "A AuraMeets atua como ambiente digital de divulgação, apresentação e aproximação entre profissionais e interessados em seus serviços.",
      "Os profissionais cadastrados atuam de maneira independente, sendo responsáveis por suas qualificações, informações profissionais, serviços, preços, agendas, atendimentos e obrigações legais.",
      "O cadastramento não estabelece, por si só, vínculo empregatício, sociedade, representação profissional ou relação de subordinação com a AuraMeets.",
      "A plataforma não substitui serviços médicos, psicológicos, psiquiátricos ou outros atendimentos regulamentados, nem serviços de emergência.",
    ],
  },
  {
    titulo: "3. Cadastro e responsabilidade pelas informações",
    paragrafos: [
      "O usuário compromete-se a fornecer informações verdadeiras, atualizadas e suficientes para utilizar os serviços.",
      "Cada pessoa é responsável pela segurança de suas credenciais e pelas atividades realizadas em sua conta.",
      "É proibido utilizar dados de terceiros sem autorização, criar perfis fraudulentos ou praticar atividades ilícitas por meio da plataforma.",
      "A AuraMeets poderá solicitar informações adicionais para verificação de identidade, segurança e conformidade.",
    ],
  },
  {
    titulo: "4. Cadastro de terapeutas e profissionais",
    paragrafos: [
      "O profissional compromete-se a apresentar informações verdadeiras sobre formação, experiência e especialidades; divulgar somente serviços que esteja legalmente habilitado a oferecer; e manter atualizados preços, modalidades, disponibilidade e condições de atendimento.",
      "Também deverá respeitar consumidores e demais profissionais, preservar a confidencialidade das informações recebidas e evitar promessas enganosas de cura ou resultados garantidos.",
      "Quando uma atividade depender de registro, licença ou habilitação profissional, caberá ao prestador manter a documentação exigida.",
    ],
  },
  {
    titulo: "5. Perfil público e divulgação profissional",
    paragrafos: [
      "Os profissionais poderão apresentar nome profissional, fotografia, especialidades, experiência, serviços, preços, modalidades de entrega, depoimentos e outros conteúdos autorizados.",
      "O profissional declara possuir os direitos necessários sobre os conteúdos publicados e autoriza sua exibição na plataforma enquanto estiverem legitimamente cadastrados.",
      "A participação em campanhas nas redes sociais da AuraMeets estará sujeita às regras específicas, à disponibilidade de datas e à organização editorial da plataforma.",
      "A escolha ou solicitação de uma data de divulgação não garante automaticamente publicação, alcance, visualizações, contatos ou vendas.",
    ],
  },
  {
    titulo: "6. Planos, mensalidades e condições comerciais",
    paragrafos: [
      "A AuraMeets poderá oferecer planos gratuitos, promocionais ou remunerados, conforme as condições individuais de contratação.",
      "O valor da mensalidade, a data de vencimento, os benefícios e eventuais condições especiais serão aqueles informados e aceitos no momento da contratação.",
      "A criação de novos planos ou valores não altera automaticamente contratos anteriores.",
      "Novos profissionais poderão estar sujeitos a condições específicas de ingresso, incluindo cobrança proporcional da primeira mensalidade, conforme informado no cadastro.",
      "A disponibilização pública do perfil poderá depender da confirmação do pagamento contratado.",
      "Alterações comerciais deverão respeitar os contratos vigentes e a legislação aplicável.",
    ],
  },
  {
    titulo: "7. Pagamentos, serviços e comissões",
    paragrafos: [
      "Os serviços poderão ser pagos diretamente ao profissional ou por meios de pagamento disponibilizados ou integrados à plataforma, conforme o fluxo oferecido no momento da contratação.",
      "Cada profissional é responsável por informar preços, condições comerciais, forma de entrega e procedimentos de atendimento.",
      "Quando houver comissões ou outros valores devidos à AuraMeets, suas regras, percentuais, prazos e condições deverão constar do contrato ou das condições comerciais específicas aceitas pelo profissional.",
      "A plataforma poderá manter registros financeiros necessários à administração dos planos, pagamentos e obrigações contratuais.",
    ],
  },
  {
    titulo: "8. Agendamentos, cancelamentos e reembolsos",
    paragrafos: [
      "O agendamento depende da disponibilidade e confirmação do profissional responsável.",
      "As condições de remarcação, cancelamento, ausência, entrega e reembolso deverão ser informadas antes da contratação, respeitando a legislação aplicável.",
      "O profissional é responsável pela execução dos serviços contratados diretamente com ele.",
      "A AuraMeets poderá auxiliar na comunicação e apuração de reclamações, sem excluir responsabilidades que lhe sejam atribuídas por lei.",
    ],
  },
  {
    titulo: "9. Experiência Presente e ofertas especiais",
    paragrafos: [
      "Os profissionais poderão disponibilizar experiências promocionais, descontos ou outras iniciativas de apresentação de seus serviços.",
      "A participação estará sujeita às condições de cada oferta, incluindo disponibilidade, modalidade, duração e limitações informadas.",
      "É proibida a divulgação de ofertas falsas, indisponíveis ou com condições omitidas.",
      "Uma experiência gratuita ou promocional não obriga o visitante a contratar serviços adicionais.",
    ],
  },
  {
    titulo: "10. Depoimentos e avaliações",
    paragrafos: [
      "A AuraMeets poderá disponibilizar funcionalidades para publicação de avaliações e depoimentos relacionados às experiências dos usuários.",
      "Os conteúdos devem ser autênticos, respeitosos e relacionados a experiências reais.",
      "Depoimentos, imagens e capturas de conversas privadas somente poderão ser publicados mediante autorização adequada das pessoas envolvidas, observada a legislação de proteção de dados.",
      "A plataforma poderá moderar, ocultar ou remover conteúdos fraudulentos, ofensivos, ilícitos ou que violem direitos de terceiros.",
    ],
  },
  {
    titulo: "11. Condutas proibidas",
    paragrafos: [
      "É proibido praticar fraudes, assédio, discriminação ou ameaças; publicar informações falsas; violar direitos autorais, de imagem ou privacidade; coletar dados sem fundamento legal; tentar invadir ou comprometer os sistemas; utilizar automações abusivas; ou promover atividades ilegais.",
    ],
  },
  {
    titulo: "12. Privacidade e proteção de dados",
    paragrafos: [
      "A AuraMeets deverá tratar dados pessoais conforme a legislação aplicável, especialmente a Lei Geral de Proteção de Dados Pessoais (LGPD).",
      "As categorias de dados, finalidades, bases legais, compartilhamentos, armazenamento, segurança e direitos dos titulares deverão estar detalhados na Política de Privacidade.",
      "Os profissionais que recebem dados de clientes também deverão cumprir suas próprias obrigações legais de proteção e confidencialidade.",
      "Dados pessoais sensíveis exigem cuidados e fundamentos legais específicos.",
    ],
  },
  {
    titulo: "13. Propriedade intelectual",
    paragrafos: [
      "A marca AuraMeets, sua identidade visual, conteúdos institucionais, software e materiais próprios são protegidos pela legislação aplicável.",
      "O acesso à plataforma não autoriza reprodução, comercialização, distribuição ou exploração de seus elementos protegidos sem permissão.",
      "Os profissionais mantêm os direitos sobre seus conteúdos, concedendo à AuraMeets a autorização necessária para exibi-los e divulgá-los nos limites das funcionalidades e campanhas autorizadas.",
    ],
  },
  {
    titulo: "14. Disponibilidade e segurança",
    paragrafos: [
      "A AuraMeets buscará manter a plataforma disponível, segura e funcional, mas poderão ocorrer interrupções por manutenção, atualizações, falhas técnicas ou eventos fora de seu controle.",
      "A plataforma poderá adotar medidas proporcionais para prevenir fraudes, acessos indevidos e violações de segurança.",
      "Nenhuma disposição destes Termos exclui responsabilidades legais que não possam ser afastadas.",
    ],
  },
  {
    titulo: "15. Suspensão e encerramento de contas",
    paragrafos: [
      "A AuraMeets poderá restringir, suspender ou encerrar contas em situações de violação destes Termos, fraude, risco à segurança, atividade ilícita ou outras hipóteses previstas contratualmente.",
      "Sempre que cabível, serão observados critérios de proporcionalidade, comunicação e possibilidade de esclarecimento.",
      "O usuário poderá solicitar o encerramento de sua conta, sem prejuízo de obrigações pendentes e retenções de dados legalmente necessárias.",
    ],
  },
  {
    titulo: "16. Alterações dos Termos de Uso",
    paragrafos: [
      "Estes Termos poderão ser atualizados para refletir mudanças legais, operacionais ou nas funcionalidades da plataforma.",
      "Alterações relevantes serão comunicadas adequadamente e, quando necessário, dependerão de nova aceitação.",
      "As condições comerciais contratadas serão respeitadas conforme a legislação e os instrumentos contratuais.",
    ],
  },
  {
    titulo: "17. Atendimento e resolução de conflitos",
    paragrafos: [
      "Dúvidas, reclamações e solicitações relacionadas à plataforma poderão ser encaminhadas para contato@aurameets.com.br.",
      "As partes buscarão solucionar divergências de boa-fé, sem prejuízo dos direitos assegurados pela legislação brasileira, inclusive quanto ao foro competente.",
    ],
  },
  {
    titulo: "18. Disposições finais",
    paragrafos: [
      "Estes Termos são regidos pela legislação brasileira, observadas as normas obrigatórias aplicáveis aos consumidores e usuários de outros países, quando pertinentes.",
      "A eventual invalidade de alguma disposição não comprometerá automaticamente as demais.",
      "A utilização da plataforma não implica renúncia a direitos legalmente assegurados.",
    ],
  },
];

export default function TermosDeUsoPage() {
  return (
    <main className="min-h-screen bg-[#FCF9FF] px-5 py-10 text-[#243454] sm:px-8 sm:py-16">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/"
          className="text-sm font-bold text-[#7935C5] hover:underline"
        >
          Voltar à AuraMeets
        </Link>

        <header className="mt-8 rounded-3xl border border-[#E7D8F2] bg-white p-7 shadow-sm sm:p-10">
          <p className="text-sm font-bold uppercase tracking-widest text-[#7935C5]">
            Documento institucional
          </p>

          <h1 className="mt-4 text-3xl font-black sm:text-4xl">
            Termos de Uso
          </h1>

          <p className="mt-4 text-sm text-[#667086]">
            Última atualização: 1º de novembro de 2026
          </p>

          <p className="mt-6 leading-8 text-[#59647B]">
            Conheça as condições de utilização da plataforma
            AuraMeets, os direitos e as responsabilidades dos
            usuários e profissionais cadastrados.
          </p>
        </header>

        <div className="mt-8 space-y-5">
          {secoes.map((secao) => (
            <section
              key={secao.titulo}
              className="rounded-2xl border border-[#E7D8F2] bg-white p-6 shadow-sm sm:p-8"
            >
              <h2 className="text-xl font-black text-[#243454]">
                {secao.titulo}
              </h2>

              <div className="mt-4 space-y-4">
                {secao.paragrafos.map((paragrafo) => (
                  <p
                    key={paragrafo}
                    className="leading-8 text-[#59647B]"
                  >
                    {paragrafo}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-[#E7D8F2] bg-white p-7 text-center">
          <p className="font-black text-[#7935C5]">
            AuraMeets
          </p>

          <p className="mt-2 text-sm text-[#59647B]">
            Conectando pessoas a profissionais que transformam vidas.
          </p>

          <Link
            href="/politica-de-privacidade"
            className="mt-5 inline-block font-bold text-[#7935C5] hover:underline"
          >
            Consultar Política de Privacidade
          </Link>
        </div>
      </div>
    </main>
  );
}
