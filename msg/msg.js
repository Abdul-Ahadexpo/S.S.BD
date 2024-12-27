// sssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss
// sssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss
// sssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss
// sssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss
// sssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss
// sssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss
// sssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss
// sssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss
// sssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss
// sssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss
// sssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss
// sssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss
// sssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss
// sssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss
// sssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss
// sssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss
// sssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss
// sssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss
// sssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss
// sssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss
// sssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss
// sssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss
// sssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss
// sssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss
// sssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss
// sssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss
// sssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss
// sssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss
// sssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss
// sssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss
// sssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss
// sssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss
// sssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss
window.onload = function () {
  const firebaseConfig = {
    apiKey: "AIzaSyDhL4CW6paTdchBzL2iTpNKInJSZI-gzQE",
    authDomain: "dorochat-cc015.firebaseapp.com",
    projectId: "dorochat-cc015",
    storageBucket: "dorochat-cc015.firebasestorage.app",
    messagingSenderId: "629677703886",
    appId: "1:629677703886:web:73987e201e59593f13c69f",
  };

  firebase.initializeApp(firebaseConfig);
  var db = firebase.database();

  class MEME_CHAT {
    create_chat_box() {
      var chat_box = document.createElement("div");
      chat_box.setAttribute("id", "chat_box_unique");
      chat_box.style.position = "fixed";
      chat_box.style.bottom = "0";
      chat_box.style.right = "0";
      chat_box.style.width = "300px";
      chat_box.style.height = "400px";
      chat_box.style.backgroundColor = "white";
      chat_box.style.border = "1px solid #ccc";
      chat_box.style.display = "none";
      chat_box.style.flexDirection = "column";
      chat_box.style.boxShadow = "0 0 10px rgba(0,0,0,0.1)";
      chat_box.style.zIndex = "1000";

      var chat_header = document.createElement("div");
      chat_header.setAttribute("id", "chat_header_unique");
      chat_header.style.padding = "10px";
      chat_header.style.backgroundColor = "#007bff";
      chat_header.style.color = "white";
      chat_header.style.textAlign = "center";
      chat_header.style.display = "flex";
      chat_header.style.justifyContent = "space-between";
      chat_header.style.alignItems = "center";

      var backButton = document.createElement("i");
      backButton.className = "fa-solid fa-backward";
      backButton.style.cursor = "pointer";
      backButton.onclick = function () {
        document.getElementById("msgbox").click();
      };

      var chatTitle = document.createElement("span");
      chatTitle.textContent = "Live Chat";

      chat_header.appendChild(backButton);
      chat_header.appendChild(chatTitle);

      var chat_content = document.createElement("div");
      chat_content.setAttribute("id", "chat_content_unique");
      chat_content.style.flex = "1";
      chat_content.style.padding = "10px";
      chat_content.style.overflowY = "auto";

      var chat_input_container = document.createElement("div");
      chat_input_container.setAttribute("id", "chat_input_container_unique");
      chat_input_container.style.padding = "10px";
      chat_input_container.style.borderTop = "1px solid #ccc";
      chat_input_container.style.display = "flex";
      chat_input_container.style.flexDirection = "column";

      var chat_input = document.createElement("input");
      chat_input.setAttribute("id", "chat_input_unique");
      chat_input.style.flex = "1";
      chat_input.style.padding = "10px";
      chat_input.style.border = "1px solid #ccc";
      chat_input.placeholder = "Type a message...";

      var chat_send = document.createElement("button");
      chat_send.setAttribute("id", "chat_send_unique");
      chat_send.textContent = "Send";
      chat_send.style.padding = "10px";
      chat_send.style.border = "none";
      chat_send.style.backgroundColor = "#007bff";
      chat_send.style.color = "white";
      chat_send.style.cursor = "pointer";

      chat_send.onclick = () => {
        if (chat_input.value.trim() !== "") {
          this.send_message(chat_input.value);
          chat_input.value = "";
        }
      };

      var name_input = document.createElement("input");
      name_input.setAttribute("id", "name_input_unique");
      name_input.style.flex = "1";
      name_input.style.padding = "10px";
      name_input.style.border = "1px solid #ccc";
      name_input.placeholder = "Enter your name...";

      var set_name_button = document.createElement("button");
      set_name_button.setAttribute("id", "set_name_button_unique");
      set_name_button.textContent = "Set Name";
      set_name_button.style.padding = "10px";
      set_name_button.style.border = "none";
      set_name_button.style.backgroundColor = "#007bff";
      set_name_button.style.color = "white";
      set_name_button.style.cursor = "pointer";

      set_name_button.onclick = () => {
        if (name_input.value.trim() !== "") {
          localStorage.setItem("name", name_input.value);
          name_input.style.display = "none";
          set_name_button.style.display = "none";

          var chat_logout = document.createElement("button");
          chat_logout.setAttribute("id", "chat_logout_unique");
          chat_logout.textContent = `${localStorage.getItem("name")} • Logout`;
          chat_logout.style.padding = "10px";
          chat_logout.style.border = "none";
          chat_logout.style.backgroundColor = "#ff4d4d";
          chat_logout.style.color = "white";
          chat_logout.style.cursor = "pointer";

          chat_logout.onclick = function () {
            localStorage.clear();
            chat_logout.remove();
            name_input.style.display = "block";
            set_name_button.style.display = "inline-block";
            if (typeof parent.home === "function") {
              parent.home();
            } else {
              alert("Returning to the home page...");
            }
          };

          chat_input_container.appendChild(chat_logout);
          name_input.value = "";
        }
      };

      const savedName = localStorage.getItem("name");
      if (savedName) {
        name_input.style.display = "none";
        set_name_button.style.display = "none";

        var chat_logout = document.createElement("button");
        chat_logout.setAttribute("id", "chat_logout_unique");
        chat_logout.textContent = `${savedName} • Logout`;
        chat_logout.style.padding = "10px";
        chat_logout.style.border = "none";
        chat_logout.style.backgroundColor = "#ff4d4d";
        chat_logout.style.color = "white";
        chat_logout.style.cursor = "pointer";

        chat_logout.onclick = function () {
          localStorage.clear();
          chat_logout.remove();
          name_input.style.display = "block";
          set_name_button.style.display = "inline-block";
          if (typeof parent.home === "function") {
            parent.home();
          }
        };

        chat_input_container.appendChild(chat_logout);
      }

      chat_input_container.append(
        name_input,
        set_name_button,
        chat_input,
        chat_send
      );
      chat_box.append(chat_header, chat_content, chat_input_container);
      document.body.append(chat_box);

      document.getElementById("msgbox").onclick = () => {
        chat_box.style.display =
          chat_box.style.display === "none" ? "flex" : "none";
      };
    }

    send_message(message) {
      var name = localStorage.getItem("name") || "Anonymous";
      db.ref("chats/SSBD/").once("value", function (message_object) {
        var index = parseFloat(message_object.numChildren()) + 1;
        db.ref("chats/SSBD/" + `message_${index}`)
          .set({
            name: name,
            message: message,
            index: index,
          })
          .then(() => {
            app.refresh_chat();
          });
      });
    }

    refresh_chat() {
      var chat_content = document.getElementById("chat_content_unique");
      db.ref("chats/SSBD/").on("value", function (messages_object) {
        chat_content.innerHTML = "";
        if (messages_object.numChildren() == 0) {
          return;
        }
        var messages = Object.values(messages_object.val());
        messages.sort((a, b) => a.index - b.index);
        messages.forEach(function (data) {
          var name = data.name;
          var message = data.message;

          var message_container = document.createElement("div");
          message_container.setAttribute(
            "id",
            `message_container_${data.index}`
          );
          message_container.style.marginBottom = "10px";

          var message_user = document.createElement("strong");
          message_user.setAttribute("id", `message_user_${data.index}`);
          message_user.textContent = `${name}: `;

          var message_content = document.createElement("span");
          message_content.setAttribute("id", `message_content_${data.index}`);
          message_content.textContent = message;

          message_container.append(message_user, message_content);
          chat_content.append(message_container);
        });
        chat_content.scrollTop = chat_content.scrollHeight;
      });
    }
  }

  var app = new MEME_CHAT();
  app.create_chat_box();
  app.refresh_chat();
};