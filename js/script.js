
// ==============================
// WHERE トップページ JavaScript
// ==============================


// ① HTMLの要素を取得

const questionCards = document.querySelectorAll(".question-card");

const resultScreen = document.querySelector("#result-screen");
const resultLabel = document.querySelector("#result-label");
const resultMessage = document.querySelector("#result-message");
const closeButton = document.querySelector("#close-result");


// ② 保存済みの問題を取得

let registeredQuestions = [];

try {

    registeredQuestions = JSON.parse(
        localStorage.getItem("registeredQuestions") || "[]"
    );

    if (!Array.isArray(registeredQuestions)) {
        registeredQuestions = [];
    }

} catch (error) {

    console.error("問題データの読み込みに失敗しました。", error);

    registeredQuestions = [];

}


// ③ 難易度の名前

const difficultyNames = {
    beginner: "初級",
    intermediate: "中級",
    advanced: "上級"
};


// ④ ランダムに問題を1つ選ぶ

function getRandomQuestion(questions) {

    const randomIndex = Math.floor(
        Math.random() * questions.length
    );

    return questions[randomIndex];

}


// ⑤ 問題カードを作成する

function createQuestionCard(question) {

    // 問題番号

    const number = document.createElement("p");

    number.className = "question-number";

    number.textContent =
        "QUESTION " + String(question.number).padStart(2, "0");


    // 問題文

    const title = document.createElement("h2");

    title.textContent = "ここはどこ？";


    // 写真

    const image = document.createElement("img");

    image.className = "question-image";

    image.alt = "問題番号 " + question.number + " の写真";

    if (question.image) {

        image.src = question.image;

    } else {

        console.error("写真データがありません:", question);

    }


    // 回答入力欄

    const input = document.createElement("input");

    input.type = "text";

    input.className = "answer-input";

    input.placeholder = "観光地名を入力してください";


    // 回答ボタン

    const button = document.createElement("button");

    button.type = "button";

    button.className = "answer-button";

    button.textContent = "回答する";


    // ⑥ 回答ボタンを押したときの処理

    button.addEventListener("click", function() {

        const userAnswer = input.value.trim();


        // 未入力チェック

        if (userAnswer === "") {

            alert("回答を入力してください。");

            return;

        }


        // 正解と別名をまとめる

        const correctAnswers = [
            question.answer,
            ...(question.aliases || [])
        ];


        // 正解判定

        const isCorrect = correctAnswers.some(
            function(answer) {

                return (
                    typeof answer === "string" &&
                    userAnswer === answer.trim()
                );

            }
        );


        // 結果を表示

        showResult(isCorrect);

    });


    // カードに追加

    const card = document.createElement("div");

    card.className = "public-question";

    card.append(
        number,
        title,
        image,
        input,
        button
    );

    return card;

}


// ⑦ 問題を表示する

function displayQuestions() {

    questionCards.forEach(function(card) {

        // 難易度を取得

        const difficulty = card.dataset.difficulty;


        // 表示場所を空にする

        card.innerHTML = "";


        // 難易度の見出し

        const title = document.createElement("h2");

        title.textContent = difficultyNames[difficulty] || "問題";

        card.appendChild(title);


        // 該当する難易度の問題を取得

        const questions = registeredQuestions.filter(
            function(question) {

                return (
                    question.difficulty === difficulty &&
                    question.status === "active"
                );

            }
        );


        // 問題がない場合

        if (questions.length === 0) {

            const message = document.createElement("p");

            message.className = "no-questions";

            message.textContent = "問題は準備中です。";

            card.appendChild(message);

            return;

        }


        // ランダムに1問選ぶ

        const selectedQuestion =
            getRandomQuestion(questions);


        // 問題カードを作成

        const questionCard =
            createQuestionCard(selectedQuestion);


        // 表示

        card.appendChild(questionCard);

    });

}


// ⑧ 正誤判定画面を表示する

function showResult(isCorrect) {

    if (!resultScreen || !resultLabel || !resultMessage) {
        return;
    }

    if (isCorrect) {

        resultScreen.className =
            "result-screen correct show";

        resultLabel.textContent = "CORRECT";

        resultMessage.textContent = "正解！";

    } else {

        resultScreen.className =
            "result-screen incorrect show";

        resultLabel.textContent = "INCORRECT";

        resultMessage.textContent = "不正解";

    }

}


// ⑨ 正誤判定画面を閉じる

if (closeButton && resultScreen) {

    closeButton.addEventListener("click", function() {

        resultScreen.classList.remove("show");

    });

}


// ⑩ ページを開いたときに問題を表示

displayQuestions();
