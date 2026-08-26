function Home() {

  return (

    <div className="home-page">

      <div className="home-content">

        <p className="home-small">
          WELCOME TO
        </p>

        <h1>
          QUIZ<span>DOM</span>
        </h1>

        <p className="home-description">
          TEST YOUR KNOWLEDGE.
          <br />
          CHALLENGE YOUR FRIENDS.
          <br />
          BECOME THE CHAMPION.
        </p>

        <div className="home-buttons">

          <button>
            START QUIZ →
          </button>

          <button className="secondary-button">
            CHALLENGE FRIEND
          </button>

        </div>

      </div>

    </div>

  );
}

export default Home;