import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div>
          <Logo />
          <p className="muted">Objetos impressos em 3D, camada por camada, feitos sob encomenda.</p>
        </div>
        <div className="footer-cols">
          <div>
            <h4>Loja</h4>
            <a href="/#loja">Produtos</a>
            <a href="/produto/chaveiro-nome">Personalizados</a>
          </div>
          <div>
            <h4>Ajuda</h4>
            <span>Prazos de produção</span>
            <span>Trocas e devoluções</span>
          </div>
          <div>
            <h4>Pagamento</h4>
            <span>Pix · Cartão · Boleto</span>
            <span>via Mercado Pago</span>
          </div>
        </div>
      </div>
      <p className="footer-copy muted small">© {new Date().getFullYear()} Gibim 3D. Protótipo.</p>
    </footer>
  );
}
