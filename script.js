// -------------------- Users --------------------
let users = JSON.parse(localStorage.getItem("users") || '[]');
if (!users.find(u => u.username==="admin")){
    users.push({username:"admin",password:"admin123",isAdmin:true,blocked:false,messages:[],friends:[],registered:new Date().toLocaleString()});
    localStorage.setItem("users",JSON.stringify(users));
}
let currentUser = localStorage.getItem("currentUser");

// -------------------- Popup --------------------
function showPopup(msg,color="red"){let popup=document.getElementById("popup");if(!popup)return;popup.style.background=color;popup.innerText=msg;popup.style.display="block";setTimeout(()=>{popup.style.display="none";},2500);}

// -------------------- Auth --------------------
function login(username,password){
    let users=JSON.parse(localStorage.getItem("users")||'[]');
    let user=users.find(u=>u.username===username&&u.password===password);
    if(!user){showPopup("Invalid credentials!");return;}
    if(user.blocked){showPopup("You are blocked!");return;}
    localStorage.setItem("currentUser",username);
    localStorage.setItem("isAdmin",user.isAdmin?"true":"false");
    showPopup("Login successful!","green");
    setTimeout(()=>{window.location=user.isAdmin?"admin.html":"index.html";},800);
}
function logout(){localStorage.removeItem("currentUser");localStorage.removeItem("isAdmin");window.location="login.html";}

function register(){
    let username=document.getElementById("reg-username").value.trim();
    let password=document.getElementById("reg-password").value.trim();
    if(!username||!password){showPopup("Fill all fields!");return;}
    let users=JSON.parse(localStorage.getItem("users")||'[]');
    if(users.find(u=>u.username===username)){showPopup("Username exists!");return;}
    users.push({username,password,isAdmin:false,blocked:false,messages:[],friends:[],registered:new Date().toLocaleString()});
    localStorage.setItem("users",JSON.stringify(users));
    showPopup("Registered successfully!","green");
    setTimeout(()=>window.location="login.html",1000);
}

// -------------------- Login enforcement --------------------
function enforceLogin(){
    currentUser=localStorage.getItem("currentUser");
    if(!currentUser){showPopup("Please login first!","red");setTimeout(()=>{window.location="login.html";},800);return;}
    let displayName=document.getElementById("username-display");
    if(displayName)displayName.innerText="Welcome, "+currentUser;
    if(localStorage.getItem("isAdmin")==="true"){let adminBtn=document.getElementById("admin-btn");if(adminBtn)adminBtn.style.display="block";}
}

// -------------------- User List / Friend (Added) --------------------
function displayUserList(){
    let container=document.getElementById("user-list");
    if(!container)return;
    container.innerHTML="";
    let users=JSON.parse(localStorage.getItem("users")||'[]');
    users.forEach(u=>{
        if(u.username===currentUser) return;
        let div=document.createElement("div"); div.className="message-card";
        let me=users.find(me=>me.username===currentUser);
        let isFriend=(me.friends||[]).includes(u.username);
        div.innerHTML=`<strong>${u.username}</strong>
            <button class="neon-btn" onclick="toggleFriend('${u.username}')">${isFriend?"Friend":"Add Friend"}</button>
            <button class="neon-btn" onclick="startChat('${u.username}')">Chat</button>`;
        container.appendChild(div);
    });
}

function toggleFriend(username){
    let users=JSON.parse(localStorage.getItem("users")||'[]');
    let me=users.find(u=>u.username===currentUser);
    let friend=users.find(u=>u.username===username);
    if(!me.friends) me.friends=[];
    if(!friend.friends) friend.friends=[];
    if(!me.friends.includes(username)){
        me.friends.push(username);
        friend.friends.push(currentUser);
        showPopup("Friend added!","green");
    } else {
        me.friends = me.friends.filter(f=>f!==username);
        friend.friends = friend.friends.filter(f=>f!==currentUser);
        showPopup("Friend removed","red");
    }
    localStorage.setItem("users",JSON.stringify(users));
    displayUserList();
}

// -------------------- Chat User-to-User --------------------
function startChat(username){
    localStorage.setItem("chatWith",username);
    window.location="conversation.html";
}

function initConversation(){
    enforceLogin();
    let chatWith=localStorage.getItem("chatWith");
    if(!chatWith) return window.location="index.html";
    document.getElementById("chat-with").innerText="Conversation with "+chatWith;
    displayConversation(chatWith);
}

function displayConversation(chatWith){
    let container=document.getElementById("conversation-list");
    if(!container)return;
    container.innerHTML="";
    let users=JSON.parse(localStorage.getItem("users")||'[]');
    let me=users.find(u=>u.username===currentUser);
    if(!me.messages) me.messages=[];
    me.messages.forEach(msg=>{
        if((msg.from===currentUser&&msg.to===chatWith)||(msg.from===chatWith&&msg.to===currentUser)){
            let div=document.createElement("div"); div.className="message-card";
            div.innerHTML=`<strong>${msg.from}</strong>: ${msg.message} <small>[${msg.time}]</small>`;
            let delBtn=document.createElement("button"); delBtn.className="neon-btn"; delBtn.innerText="Delete";
            delBtn.onclick=()=>deleteMessage(msg.time,chatWith);
            div.appendChild(delBtn);
            container.appendChild(div);
        }
    });
}

function sendChat(){
    let input=document.getElementById("chat-input");
    let msg=input.value.trim();
    if(!msg) return;
    let chatWith=localStorage.getItem("chatWith");
    let users=JSON.parse(localStorage.getItem("users")||'[]');
    let me=users.find(u=>u.username===currentUser);
    if(!me.messages) me.messages=[];
    me.messages.push({from:currentUser,to:chatWith,message:msg,time:new Date().toLocaleString()});
    let friend=users.find(u=>u.username===chatWith);
    if(!friend.messages) friend.messages=[];
    friend.messages.push({from:currentUser,to:chatWith,message:msg,time:new Date().toLocaleString()});
    localStorage.setItem("users",JSON.stringify(users));
    input.value="";
    displayConversation(chatWith);
}

function deleteMessage(time,chatWith){
    let users=JSON.parse(localStorage.getItem("users")||'[]');
    let me=users.find(u=>u.username===currentUser);
    let friend=users.find(u=>u.username===chatWith);
    me.messages = me.messages.filter(m=>!(m.time===time&&(m.from===chatWith||m.to===chatWith)));
    friend.messages = friend.messages.filter(m=>!(m.time===time&&(m.from===currentUser||m.to===currentUser)));
    localStorage.setItem("users",JSON.stringify(users));
    displayConversation(chatWith);
}

function goBack(){window.location="index.html";}

// -------------------- Contact Admin --------------------
function showContact(){document.getElementById("contact-form").style.display="block";}
function closeForm(id){document.getElementById(id).style.display="none";}
function sendMessage(){
    let subject=document.getElementById("contact-subject").value.trim();
    let message=document.getElementById("contact-message").value.trim();
    if(!subject||!message) return showPopup("Fill all fields!");
    let users=JSON.parse(localStorage.getItem("users")||'[]');
    let me=users.find(u=>u.username===currentUser);
    me.messages.push({from:currentUser,to:"admin",subject,message,time:new Date().toLocaleString()});
    let admin=users.find(u=>u.username==="admin");
    admin.messages.push({from:currentUser,to:"admin",subject,message,time:new Date().toLocaleString()});
    localStorage.setItem("users",JSON.stringify(users));
    showPopup("Message sent!","green");
    closeForm('contact-form');
}

// -------------------- Admin --------------------
function goToAdmin(){if(localStorage.getItem("isAdmin")==="true") window.location="admin.html"; else showPopup("Only admin can access!","red");}
function goToPortfolio(){window.location="index.html";}

function displayAdmin(){
    let usersTable=document.getElementById("admin-users-table");
    let messagesTable=document.getElementById("admin-messages-table");
    let users=JSON.parse(localStorage.getItem("users")||'[]');

    if(usersTable){
        usersTable.innerHTML=`<tr><th>Username</th><th>Registered At</th><th>Status</th><th>Actions</th></tr>`;
        users.forEach(u=>{
            if(u.username==="admin") return;
            let tr=document.createElement("tr");
            tr.innerHTML=`<td>${u.username}</td><td>${u.registered}</td><td>${u.blocked?"Blocked":"Active"}</td>
                <td>
                    <button onclick="blockUser('${u.username}')">Block/Unblock</button>
                    <button onclick="removeUser('${u.username}')">Remove</button>
                    <button onclick="sendAdminMessage('${u.username}')">Message</button>
                </td>`;
            usersTable.appendChild(tr);
        });
    }

    if(messagesTable){
        messagesTable.innerHTML=`<tr><th>From</th><th>To</th><th>Time</th><th>Subject</th><th>Message</th><th>Action</th></tr>`;
        users.forEach(u=>{
            if(!u.messages) return;
            u.messages.forEach(m=>{
                if(m.to==="admin" || m.from==="admin"){
                    let tr=document.createElement("tr");
                    tr.innerHTML=`<td>${m.from}</td><td>${m.to}</td><td>${m.time}</td><td>${m.subject||""}</td><td>${m.message}</td>
                        <td>
                            <button onclick="adminReply('${m.from}','${m.time}')">Reply</button>
                            <button onclick="adminDeleteMessage('${u.username}','${m.time}')">Delete</button>
                        </td>`;
                    messagesTable.appendChild(tr);
                }
            });
        });
    }
}

function blockUser(username){
    let users=JSON.parse(localStorage.getItem("users")||'[]');
    let user=users.find(u=>u.username===username);
    if(user){user.blocked=!user.blocked;localStorage.setItem("users",JSON.stringify(users));displayAdmin();showPopup(user.blocked?"User blocked":"User unblocked","green");}
}

function removeUser(username){
    let users=JSON.parse(localStorage.getItem("users")||'[]');
    users=users.filter(u=>u.username!==username);
    localStorage.setItem("users",JSON.stringify(users));
    displayAdmin();
    showPopup("User removed","green");
}

function adminReply(username,time){
    let reply=prompt(`Reply to ${username}?`);
    if(reply){
        let users=JSON.parse(localStorage.getItem("users")||'[]');
        let user=users.find(u=>u.username===username);
        if(!user.messages) user.messages=[];
        user.messages.push({from:"Admin",to:username,message:reply,time:new Date().toLocaleString()});
        localStorage.setItem("users",JSON.stringify(users));
        displayAdmin();
        showPopup("Reply sent","green");
    }
}

function adminDeleteMessage(username,time){
    let users=JSON.parse(localStorage.getItem("users")||'[]');
    let user=users.find(u=>u.username===username);
    if(user && user.messages){
        user.messages = user.messages.filter(m=>!(m.time===time && (m.from==="Admin" || m.to==="Admin")));
        localStorage.setItem("users",JSON.stringify(users));
        displayAdmin();
        showPopup("Message deleted","red");
    }
}

function sendAdminMessage(username){
    let msg=prompt(`Send new message to ${username}:`);
    if(msg){
        let users=JSON.parse(localStorage.getItem("users")||'[]');
        let user=users.find(u=>u.username===username);
        if(!user.messages) user.messages=[];
        user.messages.push({from:"Admin",to:username,message:msg,time:new Date().toLocaleString()});
        localStorage.setItem("users",JSON.stringify(users));
        displayAdmin();
        showPopup("Message sent to user","green");
    }
}