
// ==============================
// WHERE 管理画面 JavaScript
// ==============================


// ① HTMLの要素を取得

const questionNumber =
    document.querySelector("#question-number");

const difficulty =
    document.querySelector("#question-difficulty");

const imageInput =
    document.querySelector("#question-image");

const imagePreview =
    document.querySelector("#image-preview");

const correctAnswer =
    document.querySelector("#correct-answer");

const answerAlias =
    document.querySelector("#answer-alias");

const registerButton =
    document.querySelector("#register-button");

const activeQuestions =
    document.querySelector("#active-questions");

const answeredQuestions =
    document.querySelector("#answered-questions");

const deletedQuestions =
    document.querySelector("#deleted-questions");


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

    console.error("問題データの読み込みに失敗しました。");

    registeredQuestions = [];

}


// ③ 難易度を日本語に変換

function getDifficultyName(level) {

    const names = {
        beginner: "初級",
        intermediate: "中級",
        advanced: "上級"
    };

    return names[level] || "未設定";

}


// ④ 問題データを保存する

function saveQuestions() {

    try {

        localStorage.setItem(
            "registeredQuestions",
            JSON.stringify(registeredQuestions)
        );

        return true;

    } catch (error) {

        console.error("保存に失敗しました。", error);

        return false;

    }

}


// ⑤ 次に使用する問題番号を取得

function getNextQuestionNumber() {

    if (registeredQuestions.length === 0) {
        return 1;
    }

    const usedNumbers = registeredQuestions.map(
        function(question) {
            return Number(question.number);
        }
    );

    return Math.max(...usedNumbers) + 1;

}


// 初期の問題番号を設定

questionNumber.value = getNextQuestionNumber();


// ⑥ 写真のプレビュー

let previewUrl = null;

imageInput.addEventListener("change", function() {

    const file = imageInput.files[0];

    if (previewUrl !== null) {

        URL.revokeObjectURL(previewUrl);

        previewUrl = null;

    }

    if (!file) {

        imagePreview.hidden = true;

        imagePreview.removeAttribute("src");

        return;

    }

    if (!file.type.startsWith("image/")) {

        alert("画像ファイルを選択してください。");

        imageInput.value = "";

        imagePreview.hidden = true;

        imagePreview.removeAttribute("src");

        return;

    }

    previewUrl = URL.createObjectURL(file);

    imagePreview.src = previewUrl;

    imagePreview.hidden = false;

});


// ⑦ 問題カードを作成

function createQuestionCard(question) {

    const card = document.createElement("div");

    card.className = "registered-question";


    // 写真

    const image = document.createElement("img");

    image.src = question.image;

    image.alt = "問題番号 " + question.number + " の写真";


    // 問題情報

    const info = document.createElement("div");

    info.className = "registered-question-info";


    // 問題番号

    const number = document.createElement("p");

    number.textContent =
        "問題番号：" + question.number;


    // 難易度

    const level = document.createElement("p");

    level.className = "difficulty-label";

    level.textContent =
        getDifficultyName(question.difficulty);


    info.append(number, level);


    // 回答状態

    const status = document.createElement("p");


    if (question.status === "answered") {

        status.textContent = "回答済み";

        status.className = "status-answered";

        info.appendChild(status);


        const answer = document.createElement("p");

        answer.textContent =
            "正解：" + question.answer;


        const aliases = document.createElement("p");

        aliases.textContent =
            "別名：" + (question.aliases || []).join("、");


        info.append(answer, aliases);

    } else if (question.status === "deleted") {

        status.textContent = "削除済み";

        status.className = "status-deleted";

        info.appendChild(status);

        const previousStatus = document.createElement("p");

        previousStatus.textContent =
            "削除前の状態：" +
            (question.statusBeforeDeletion === "answered"
                ? "回答済み"
                : "回答受付中");

        info.appendChild(previousStatus);

        if (question.deletedAt) {

            const deletedDate = document.createElement("p");

            deletedDate.textContent =
                "削除日時：" + question.deletedAt;

            info.appendChild(deletedDate);

        }

    } else {

        status.textContent = "回答受付中";

        status.className = "status-active";

        info.appendChild(status);

    }


    // 操作ボタン

    const actionButton = document.createElement("button");

    actionButton.type = "button";


    // 削除済みの場合は復元ボタン

    if (question.status === "deleted") {

        actionButton.className = "restore-button";

        actionButton.textContent = "復元する";


        actionButton.addEventListener("click", function() {

            const confirmed = confirm(
                "問題番号 " + question.number +
                " を復元しますか？"
            );

            if (!confirmed) {
                return;
            }


            // 削除前の状態に戻す

            const previousStatus =
                question.statusBeforeDeletion;

            question.status =
                previousStatus === "answered"
                    ? "answered"
                    : "active";


            delete question.statusBeforeDeletion;

            delete question.deletedAt;


            // 保存

            if (!saveQuestions()) {

                question.status = "deleted";

                question.statusBeforeDeletion = previousStatus;

                alert("復元できませんでした。");

                return;

            }


            displayQuestions();

            alert("問題を復元しました！");

        });


    } else {

        // 削除ボタン

        actionButton.className = "delete-button";

        actionButton.textContent = "削除";


        actionButton.addEventListener("click", function() {

            const confirmed = confirm(
                "問題番号 " + question.number +
                " を削除済みにしますか？"
            );

            if (!confirmed) {
                return;
            }


            // 削除前の状態を保存

            const previousStatus = question.status;


            question.statusBeforeDeletion =
                previousStatus === "answered"
                    ? "answered"
                    : "active";

            question.status = "deleted";

            question.deletedAt =
                new Date().toLocaleString("ja-JP");


            // 保存

            if (!saveQuestions()) {

                question.status = previousStatus;

                delete question.statusBeforeDeletion;

                delete question.deletedAt;

                alert("削除できませんでした。");

                return;

            }


            displayQuestions();

            alert("問題を削除済みにしました。");

        });

    }


    // カードに追加

    card.append(
        image,
        info,
        actionButton
    );

    return card;

}


// ⑧ 問題一覧を表示

function displayQuestions() {

    activeQuestions.innerHTML = "";

    answeredQuestions.innerHTML = "";

    deletedQuestions.innerHTML = "";


    // 回答受付中

    const activeList = registeredQuestions
        .filter(function(question) {

            return (
                question.status !== "answered" &&
                question.status !== "deleted"
            );

        })
        .sort(function(a, b) {

            return Number(a.number) - Number(b.number);

        });


    // 回答済み

    const answeredList = registeredQuestions
        .filter(function(question) {

            return question.status === "answered";

        })
        .sort(function(a, b) {

            return Number(a.number) - Number(b.number);

        });


    // 削除済み

    const deletedList = registeredQuestions
        .filter(function(question) {

            return question.status === "deleted";

        })
        .sort(function(a, b) {

            return Number(a.number) - Number(b.number);

        });


    // 回答受付中の問題を表示

    activeList.forEach(function(question) {

        activeQuestions.appendChild(
            createQuestionCard(question)
        );

    });


    // 回答済みの問題を表示

    answeredList.forEach(function(question) {

        answeredQuestions.appendChild(
            createQuestionCard(question)
        );

    });


    // 削除済みの問題を表示

    deletedList.forEach(function(question) {

        deletedQuestions.appendChild(
            createQuestionCard(question)
        );

    });


    // 空の場合のメッセージ

    if (activeList.length === 0) {

        activeQuestions.innerHTML =
            '<p class="no-questions">回答受付中の問題はありません。</p>';

    }

    if (answeredList.length === 0) {

        answeredQuestions.innerHTML =
            '<p class="no-questions">回答済みの問題はありません。</p>';

    }

    if (deletedList.length === 0) {

        deletedQuestions.innerHTML =
            '<p class="no-questions">削除済みの問題はありません。</p>';

    }

}


// ⑨ 問題を登録する

registerButton.addEventListener("click", function() {


    // 入力内容を取得

    const number = Number(questionNumber.value);

    const level = difficulty.value;

    const image = imageInput.files[0];

    const answer = correctAnswer.value.trim();

    const aliases = answerAlias.value
        .split("\n")
        .map(function(alias) {

            return alias.trim();

        })
        .filter(function(alias) {

            return alias !== "";

        });


    // 問題番号の確認

    if (
        questionNumber.value.trim() === "" ||
        !Number.isInteger(number) ||
        number < 1
    ) {

        alert("正しい問題番号を入力してください。");

        return;

    }


    // 使用済み番号の確認
    // 削除済みの問題も含めて確認する

    const duplicate = registeredQuestions.some(
        function(question) {

            return Number(question.number) === number;

        }
    );

    if (duplicate) {

        alert(
            "この問題番号は使用済みです。別の番号を入力してください。"
        );

        return;

    }


    // 難易度の確認

    if (
        !["beginner", "intermediate", "advanced"].includes(level)
    ) {

        alert("難易度を選択してください。");

        return;

    }


    // 写真の確認

    if (!image) {

        alert("写真を選択してください。");

        return;

    }

    if (!image.type.startsWith("image/")) {

        alert("画像ファイルを選択してください。");

        return;

    }


    // 正解の確認

    if (answer === "") {

        alert("正解を入力してください。");

        return;

    }


    // 写真を読み込む

    const reader = new FileReader();


    reader.onload = function() {

        const newQuestion = {

            number: number,

            difficulty: level,

            image: reader.result,

            answer: answer,

            aliases: aliases,

            status: "active"

        };


        // 問題を追加

        registeredQuestions.push(newQuestion);


        // 保存

        if (!saveQuestions()) {

            registeredQuestions.pop();

            alert(
                "保存できませんでした。写真のサイズが大きすぎる可能性があります。"
            );

            return;

        }


        // 一覧を更新

        displayQuestions();


        // 入力欄をリセット

        questionNumber.value = getNextQuestionNumber();

        difficulty.value = "";

        imageInput.value = "";

        correctAnswer.value = "";

        answerAlias.value = "";


        // プレビューを消す

        imagePreview.hidden = true;

        imagePreview.removeAttribute("src");

        if (previewUrl !== null) {

            URL.revokeObjectURL(previewUrl);

            previewUrl = null;

        }


        alert("問題を登録しました！");

    };


    reader.onerror = function() {

        alert("写真の読み込みに失敗しました。");

    };


    reader.readAsDataURL(image);

});


// ⑩ ページを開いたときに一覧を表示

displayQuestions();
