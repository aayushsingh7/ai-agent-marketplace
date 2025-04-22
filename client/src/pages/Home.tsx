import { FC } from "react";
import styles from "../styles/pages/Home.module.css";
import Button from "../components/ui/Button";
import { GiTwoCoins } from "react-icons/gi";
import { RiRobot3Fill } from "react-icons/ri";
import { BsFillLightningChargeFill } from "react-icons/bs";
import { TbContract } from "react-icons/tb";
import { FaHandsHelping } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

interface HomeProps {}

const Home: FC<HomeProps> = ({}) => {
  const navigate = useNavigate();
  return (
    <div className={styles.home_page}>
      <header>
        <nav>
          <h3>
            Sei<span>Agents</span>
          </h3>
          <Button onClick={() => navigate("/auth")}>Connect Wallet</Button>
        </nav>
      </header>
      <section className={styles.hero_section}>
        <div className={styles.hero_section_texts}>
          <h1>
            Build. List. Earn. Monetize Your AI Bots with <span>$SEI</span>
          </h1>
          <Button onClick={() => navigate("/auth")}>Explore Agents</Button>
        </div>
      </section>

      <section className={styles.how_it_works} id="how">
        <h2>How It Works?</h2>
        <div className={`${styles.steps} ${styles.coo}`}>
          <span className={styles.line}></span>
          <span className={styles.step_span}>1</span>
          <span className={styles.step_span}>2</span>
          <span className={styles.step_span}>3</span>
          <span className={styles.step_span}>4</span>
        </div>
        <div className={styles.steps}>
          <div className={styles.step}>
            <h3>Explore AI Agents</h3>
            <p>
              Browse a decentralized marketplace of AI agents built by
              developers — ranging from chatbots to content generators.
            </p>
          </div>

          <div className={styles.step}>
            <h3>Buy Credits or NFTs</h3>
            <p>
              Purchase credits via smart contract to rent agents or buy entire
              agents as NFTs for full access and ownership.
            </p>
          </div>

          <div className={styles.step}>
            <h3>Unlock Access</h3>
            <p>
              Access is granted through on-chain validation while the agents run
              off-chain for fast and efficient performance.
            </p>
          </div>

          <div className={styles.step}>
            <h3>Use the Agent</h3>
            <p>
              Interact with the agent via API or platform interface — powered by
              your credits or NFT-based access rights.
            </p>
          </div>
        </div>
      </section>

      {/* <section className={styles.features}>
        <h2>Features</h2>
        <div className={styles.features_grid}>
          <figure>
            <GiTwoCoins />
            <figcaption>
              <h3>Decentralized Payments with $SEI</h3>
              <p>
                Pay directly to bot creators using $SEI — no need for smart
                contracts or intermediaries. A seamless, crypto-native payment
                system.
              </p>
            </figcaption>
          </figure>

          <figure>
            <RiRobot3Fill />
            <figcaption>
              <h3>Diverse AI Marketplace</h3>
              <p>
                Browse a wide variety of AI bots designed for different
                use-cases: from chatbots and automation to content generation
                and data analysis.
              </p>
            </figcaption>
          </figure>

          <figure>
            <BsFillLightningChargeFill />
            <figcaption>
              <h3>Instant Bot Access</h3>
              <p>
                Once payment is confirmed, get immediate access to your rented
                AI bot through secure off-chain verification.
              </p>
            </figcaption>
          </figure>

          <figure>
            <TbContract />
            <figcaption>
              <h3>No Smart Contracts Required</h3>
              <p>
                Simplify the experience for users and developers by avoiding the
                complexity of smart contracts. Direct transactions make
                everything faster.
              </p>
            </figcaption>
          </figure>

          <figure>
            <FaHandsHelping />
            <figcaption>
              <h3>Developer-Friendly</h3>
              <p>
                Monetize your AI bots directly, with no middlemen. Publish bots
                and earn revenue in $SEI for every use.
              </p>
            </figcaption>
          </figure>
        </div>
      </section> */}

      <section className={styles.features}>
        <h2>Features</h2>
        <div className={styles.features_grid}>
          <figure>
            <GiTwoCoins />
            <figcaption>
              <h3>On-Chain Credit System</h3>
              <p>
                Users purchase credits through a smart contract to rent AI
                agents. Credits are the gateway to seamless access.
              </p>
            </figcaption>
          </figure>

          <figure>
            <RiRobot3Fill />
            <figcaption>
              <h3>Decentralized AI Marketplace</h3>
              <p>
                Discover and access a wide range of AI agents including
                chatbots, content tools, automation scripts, and more.
              </p>
            </figcaption>
          </figure>

          <figure>
            <BsFillLightningChargeFill />
            <figcaption>
              <h3>Fast Off-Chain Execution</h3>
              <p>
                AI agents run off-chain via APIs or cloud services, ensuring
                quick performance while using blockchain for access control.
              </p>
            </figcaption>
          </figure>

          <figure>
            <TbContract />
            <figcaption>
              <h3>Agent Ownership via NFTs</h3>
              <p>
                Buy AI agents as NFTs to gain full ownership, transferability,
                and resale rights — enabling a new model of digital asset
                licensing.
              </p>
            </figcaption>
          </figure>

          <figure>
            <FaHandsHelping />
            <figcaption>
              <h3>Creator-Centric Monetization</h3>
              <p>
                Developers earn directly from rentals or NFT sales. No
                gatekeepers, no hidden fees — just pure value exchange.
              </p>
            </figcaption>
          </figure>
        </div>
      </section>
    </div>
  );
};

export default Home;
