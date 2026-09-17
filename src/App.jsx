import { useEffect, useState } from "react";
import "./App.css";

const birthdayQuotes = {
  opening: "Have you moved on, or are you still stuck in our past?",

  letter: [
    "You said forever, so what happened to that?",
    "You even said, 'If not me, then no one else.' But how could you run away with someone else?",
    "You said you would die... Have you already died after all this?",
    "Whatever you did, I don't care anymore.",
    "But there is one thing I want to tell you - forever: I love you.",
    "And I am ashamed of the one I loved."
  ],

  photo:
    "The biggest lesson I learnt this year is probably to not give so much of yourself to people who will not do the same for you.",

  final:
    "There was a love in your eyes, but it was just a reflection of mine. In that way, have you ever seen love in my eyes?"
};

function App() {
  const [page, setPage] = useState(-1);
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [noStyle, setNoStyle] = useState({});
  const [viewAnswers, setViewAnswers] = useState(false);
  const [savedAnswers, setSavedAnswers] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem("mehraru_answer");

    if (saved) {
      setAnswer(saved);
    }
  }, []);

  const dodgeNo = () => {
    setNoStyle({
      transform: `translate(
        ${Math.random() * 220 - 110}px,
        ${Math.random() * 140 - 70}px
      )`
    });
  };

 
const submitAnswer = async () => {
  const cleanAnswer = answer.trim();

  if (!cleanAnswer) {
    alert("Please write your answer first.");
    return;
  }

  try {
    const response = await fetch("/api/answers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        answer: cleanAnswer
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || `HTTP ${response.status}`);
    }

    if (data.success) {
      localStorage.setItem("mehraru_answer", cleanAnswer);
      setSubmitted(true);
    } else {
      alert("Your answer could not be saved.");
    }
  } catch (error) {
    console.error("ANSWER SAVE ERROR:", error);
    alert("Could not save your answer. Please try again.");
  }
};
  const loadAnswers = async () => {
    const password = window.prompt("Enter owner password:");

    if (!password) return;

    try {
    
const response = await fetch(
  "http://127.0.0.1:8000/api/answers",        {
          headers: {
            "X-Owner-Password": password
          }
        }
      );

      if (response.status === 401) {
        alert("Wrong owner password.");
        return;
      }

      if (!response.ok) {
        alert("Could not load answers.");
        return;
      }

      const data = await response.json();

      setSavedAnswers(data);
      setViewAnswers(true);
    } catch (error) {
      alert("Could not connect to the answer server.");
    }
  };

  if (viewAnswers) {
    return (
      <main className="birthday-page answer-viewer-page">
        <div className="stars">
          {Array.from({ length: 40 }).map((_, i) => (
            <span
              key={i}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 4}s`
              }}
            />
          ))}
        </div>

        <section className="final-page">
          <div className="final-glow"></div>

          <div className="final-content answer-viewer-content">
            <p className="final-eyebrow">
              PRIVATE ANSWER BOX
            </p>

            <div className="final-heart">&hearts;</div>

            <h1 className="final-title">
              Her Answers
            </h1>

            {savedAnswers.length === 0 ? (
              <div className="answer-thankyou">
                <h2>No answers yet.</h2>

                <p>
                  When an answer is submitted, it will appear here.
                </p>
              </div>
            ) : (
              <div className="saved-answers">
                {savedAnswers.map((item) => (
                  <article
                    className="saved-answer-card"
                    key={item.id}
                  >
                    <p className="saved-answer-text">
                      {item.answer}
                    </p>

                    <div className="saved-answer-date">
                      {new Date(
                        item.created_at
                      ).toLocaleString()}
                    </div>
                  </article>
                ))}
              </div>
            )}

            <button
              className="next-button"
              onClick={loadAnswers}
            >
              REFRESH ANSWERS
              <span>&#8635;</span>
            </button>

            <button
              className="next-button owner-answer-button"
              onClick={() => setViewAnswers(false)}
            >
              BACK TO WEBSITE
              <span>&#8592;</span>
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="birthday-page">

      <div className="stars">
        {Array.from({ length: 40 }).map((_, i) => (
          <span
            key={i}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      {/* PAGE -1 : BIRTHDAY CHECK */}

      {page === -1 && (
        <section className="opening">
          <div className="tiny-title">
            JUST ONE QUESTION...
          </div>

          <div className="heart">
            &hearts;
          </div>

          <h1 className="opening-title">
            Is't ur birthday?
          </h1>

          <div className="opening-buttons">
            <button
              className="next-button"
              onClick={() => setPage(0)}
            >
              YES
              <span>&#8594;</span>
            </button>

            <button
              className="next-button no-button"
              style={noStyle}
              onMouseEnter={dodgeNo}
              onTouchStart={dodgeNo}
              onClick={dodgeNo}
            >
              NO
            </button>
          </div>
        </section>
      )}

      {/* PAGE 0 : OPENING */}

      {page === 0 && (
        <section className="opening">
          <div className="tiny-title">
            A LITTLE SURPRISE FOR SOMEONE SPECIAL
          </div>

          <div className="heart">
            &hearts;
          </div>

          <h1 className="opening-title">
            {birthdayQuotes.opening}
          </h1>

          <p className="opening-subtitle">
            Take a moment. This one is just for you. &hearts;
          </p>

          <button
            className="next-button"
            onClick={() => setPage(1)}
          >
            OPEN YOUR SURPRISE
            <span>&#8594;</span>
          </button>
        </section>
      )}

      {/* PAGE 1 : BIRTHDAY */}

      {page === 1 && (
        <section className="reveal-page">
          <div className="reveal-content">

            <p className="letter-eyebrow">
              FOR YOU, ANJALI
            </p>

            <div className="letter-divider">
              <span></span>
              <span>&hearts;</span>
              <span></span>
            </div>

            <h1 className="final-title">
              Happy Birthday,
              <br />
              <span>ANJALI</span>
            </h1>

            <p className="personal-quote">
              Some people enter our lives and leave
              behind memories that never really disappear.
            </p>

            <button
              className="next-button"
              onClick={() => setPage(2)}
            >
              THERE'S SOMETHING MORE
              <span>&#8594;</span>
            </button>

          </div>
        </section>
      )}

      {/* PAGE 2 : LETTER */}

      {page === 2 && (
        <section className="letter-page">

          <div className="letter-card">

            <p className="letter-eyebrow">
              SOMETHING I WANTED TO SAY
            </p>

            <div className="letter-divider">
              <span></span>
              <span>&hearts;</span>
              <span></span>
            </div>

            <div className="letter-text">
              {birthdayQuotes.letter.map(
                (text, index) => (
                  <p key={index}>
                    {text}
                  </p>
                )
              )}
            </div>

            <button
              className="next-button"
              onClick={() => setPage(3)}
            >
              THERE'S MORE
              <span>&#8594;</span>
            </button>

          </div>

        </section>
      )}

      {/* PAGE 3 : PHOTO */}

      {page === 3 && (
        <section className="photo-page">

          <div className="photo-page-inner">

            <p className="letter-eyebrow">
              ONE THING I LEARNT
            </p>

            <div className="letter-divider">
              <span></span>
              <span>&hearts;</span>
              <span></span>
            </div>

            <img
              src="/MehraruBirthday/photos/birthday-bright.jpg"
              alt="A special memory"
              className="photo-main"
            />

            <p className="personal-quote">
              {birthdayQuotes.photo}
            </p>

            <button
              className="next-button"
              onClick={() => setPage(4)}
            >
              ONE LAST THING
              <span>&#8594;</span>
            </button>

          </div>

        </section>
      )}

      {/* PAGE 4 : FINAL MESSAGE */}

      {page === 4 && (
        <section className="final-page">

          <div className="final-glow"></div>

          <div className="final-content">

            <p className="final-eyebrow">
              ONE LAST THING...
            </p>

            <div className="final-heart">
              &hearts;
            </div>

            <h1 className="final-title">
              Happy Birthday,
              <br />
              <span>ANJALI</span>
            </h1>

            <div className="final-line"></div>

            <p className="final-message personal-final-quote">
              There was a love in your eyes,
              <br />
              but it was just a reflection of mine.
              <br />
              In that way, have you ever seen
              <br />
              love in my eyes?
            </p>

            <div className="final-stars">
              &#10022; &nbsp; &hearts; &nbsp; &#10022;
            </div>

            <button
              className="next-button"
              onClick={() => setPage(5)}
            >
              ONE LAST QUESTION
              <span>&#8594;</span>
            </button>

          </div>

        </section>
      )}

      {/* PAGE 5 : ANSWER */}

      {page === 5 && (
        <section className="final-page answer-page">

          <div className="final-glow"></div>

          <div className="final-content answer-content">

            <p className="final-eyebrow">
              BEFORE YOU LEAVE...
            </p>

            <div className="final-heart">
              &hearts;
            </div>

            <h1 className="final-title">
              Tell me honestly...
            </h1>

            <p className="personal-final-quote">
              After everything you have read,
              <br />
              what do you really want to say?
            </p>

            {!submitted ? (
              <>
                <textarea
                  className="answer-box"
                  value={answer}
                  onChange={(e) =>
                    setAnswer(e.target.value)
                  }
                  placeholder="Write your answer here..."
                  rows={7}
                />

                <button
                  className="next-button answer-submit"
                  onClick={submitAnswer}
                  disabled={!answer.trim()}
                >
                  SEND YOUR ANSWER
                  <span>&#8594;</span>
                </button>
              </>
            ) : (
              <div className="answer-thankyou">

                <div className="answer-check">
                  &hearts;
                </div>

                <h2>
                  Your words have been saved.
                </h2>

                <p>
                  Thank you for answering honestly.
                </p>

              </div>
            )}

            <button
              className="next-button owner-answer-button"
              onClick={loadAnswers}
            >
              OWNER
              <span>&#8594;</span>
            </button>

          </div>

        </section>
      )}

    </main>
  );
}

export default App;
