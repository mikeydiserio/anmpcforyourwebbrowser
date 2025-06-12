import * as S from "./Footer.styles";

export const Footer = () => {
  return (
    <S.Footer>
      <div className="container">
        <div className="S.Footer-content">
          <div className="S.Footer-about">
            <div className="S.Footer-logo">
              <i className="fas fa-drum"></i>
              <h2>The Breakbeat Library</h2>
            </div>
            <p>
              Preserving the rhythmic foundation of modern music since 2023. Our
              mission is to document, archive, and celebrate the breakbeats that
              shaped musical history.
            </p>
            <div className="social-links">
              <a href="#">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#">
                <i className="fab fa-youtube"></i>
              </a>
              <a href="#">
                <i className="fab fa-soundcloud"></i>
              </a>
            </div>
          </div>

          <div className="S.Footer-links">
            <h4>Explore</h4>
            <ul>
              <li>
                <a href="#">Breakbeat Database</a>
              </li>
              <li>
                <a href="#">Sample Origins</a>
              </li>
              <li>
                <a href="#">Artist Spotlights</a>
              </li>
              <li>
                <a href="#">Production Tutorials</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
			<p> © mikey diserio 2025</p>

    </S.Footer>
  );
};
