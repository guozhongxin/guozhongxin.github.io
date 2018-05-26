/**
 * Created by zhogu on 5/20/2018.
 */
let nebulas = require("nebulas");
let Account = nebulas.Account;

let NebPay = require("nebpay");
let nebPay = new NebPay();
let serialNumber;
let mainnetUrl = "https://pay.nebulas.io/api/mainnet/pay",
    testnetUrl = "https://pay.nebulas.io/api/pay";

let callbackUrl = mainnetUrl;


let contractAdd = "n1ojSPget9xBnPMpR7QzX8XAe6wf1qwt65p";
let scGetLastDiaries = "getLastDiaries";
let scGetSelf = "getSelf";
let scGetByWriter = "getByWriter";
let scGetDiarybyIndex = "getDiaryByIndex";
let scGetUserDiaryCount = "getUserDiaryCount";
let scGetAllUsers = "getAllUsers";
let scGetAllUsersDiaryCount = "getAllUsersDiaryCount";
let scGetUserCount = "getUserCount";
let scGetDiaryCount = "getDiaryCount";
let scAddDiary = "addDiary";

// the minimum diary index shown in the page
let oldestDiaryIndex = Number.MAX_VALUE;
// the max number of diaries each loading
let numberEachLoad = 5;

let userKey = 'curUser';

String.prototype.replaceAll  = function(s1,s2){
    return this.replace(new RegExp(s1,"gm"),s2);
};

$(window).ready(function () {
    let currentUser = localStorage.getItem(userKey);
    if (currentUser != undefined) {
        setAddress(currentUser);
    }
});

function logout() {
    localStorage.removeItem(userKey);
    $("#id_form_login").css("margin", "8px");
    $("#id_div_login").show();
    $("#id_div_creator").hide();

}

function setAddress(addr) {
    localStorage.setItem(userKey, addr);
    $("#id_p_creator").html(addr + "   ");
    $("#id_div_login").hide();
    $("#id_form_login").css("margin", "0");
    $("#id_div_creator").show();
}

function setDiaryItem(address, content, time, isEncrypted) {
    const date = new Date(time);
    const dateString = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours()
        + ":" + date.getMinutes() + ":" + date.getSeconds();
    const isHidden = ( isEncrypted) ? ('') : ('hidden="true"');
    const panelStyle = isEncrypted ? "panel-danger" : "panel-success";
    const header = (address === "") ? ('<div class="panel-heading address"></div>')
        : ('<div class="panel-heading address">作者： ' + address + '</div>');

    content =  content.replaceAll("\\n","<br>");
    const div = '<div class="panel '
        + panelStyle
        + '">' + header
        + '<div style="word-wrap:break-word" class="panel-body">'
        + content
        + '</div><div class="panel-footer"><div class="row"><div class="col-lg-6" >'
        + dateString
        + '</div><div class="col-lg-6" '
        + isHidden
        + '><form><div class="input-group"><input type="text" class="form-control" placeholder="密码"/>'
        + '<span class="input-group-btn"><a name="name_decrypt" class="btn btn-default">解密</a></span>'
        + '</div></form></div></div></div><div class="panel-body" style="word-wrap:break-word" hidden="true"></div></div>';
    return div;
}

function decryptDiary() {
    console.log($(this));
    let thisDiv = $(this)[0].parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;
    let diaryContent = thisDiv.children[1].innerText;
    let key = $(this)[0].parentNode.parentNode.children[0].value;

    let decrypted = "";

    try {
        decrypted = AesCtr.decrypt(diaryContent, key, 256);
        if (decrypted === "") {
            decrypted = "（解密结果为空）"
        }
    } catch (Error) {
        decrypted = "解密失败，请检查密码是否正确（Decryption failed, please check the correction of the Key）";
    }

    thisDiv.children[3].innerText = decrypted;
    $(thisDiv.children[3]).show();
}

function showDiaries(resp) {
    precheckSimuCallResponse(resp);

    const result = JSON.parse(resp.result);

    for (let i = 0; i < result.length; i++) {
        const index = result[i].index;
        const user = result[i].user;
        const diaryConent = result[i].diary.content;
        const diaryTime = result[i].diary.time;
        const isEncoded = result[i].diary.en;
        if (index < oldestDiaryIndex) {
            oldestDiaryIndex = index;
        }
        $("#id_div_diarylist").append(setDiaryItem(user, diaryConent, diaryTime, isEncoded));
    }
    bindFun();
}

function showDiariesOfSomeone(resp) {
    precheckSimuCallResponse(resp);

    const result = JSON.parse(resp.result);

    $("#id_div_diarylist")[0].innerText = "";
    for (let i = result.length - 1; i >= 0; i--) {

        const diaryConent = result[i].content;
        const diaryTime = result[i].time;
        const isEncoded = result[i].en;

        $("#id_div_diarylist").append(setDiaryItem("", diaryConent, diaryTime, isEncoded));
    }

    bindFun();
    $("#id_div_diaryCount")[0].innerText = "共 " + result.length + " 篇日记. (绿色为未加密日记，红色为加密日记)";
}

function setUserItem(index, userAddr, userDiaryCount) {

    return '<tr><td>'
        + index
        + '</td><td>'
        + userAddr
        + '</td><td>'
        + userDiaryCount
        + '</td><td><a style="width: 100%" class="btn btn-success" href="./userDiary.html?'
        + userAddr
        + '">查看主页</a></td></tr>';
}

function showAllUsersDiaryCount(resp) {
    precheckSimuCallResponse(resp);
    const result = JSON.parse(resp.result);
    $("#id_table_users tbody")[0].innerHTML = "";
    for (let i = 0; i < result.length; i++) {
        const userAddr = result[i].user;
        const userDiaryCount = result[i].count;

        $("#id_table_users tbody").append(setUserItem(i + 1, userAddr, userDiaryCount));
    }
}

function precheckSimuCallResponse(resp) {
    console.log("resp: " + JSON.stringify(resp));
    const res = (resp.execute_err === "");
    if(!res){
        window.alert("调用合约失败： "+ JSON.stringify(resp))
    }
    return res;
}

function bindFun() {
    $("a[name='name_decrypt']").click(decryptDiary);
}

function onload() {
    oldestDiaryIndex = Number.MAX_VALUE;
    $("#id_div_diarylist")[0].innerText = "";
    getLastDiaries(numberEachLoad);

}

function refresh() {
    //TODO : only get new diaries
    onload();
}

function loadMore() {
    if (oldestDiaryIndex <= 0) {
        window.alert("没有更多了");
        return;
    }
    getDiariesByIndex(oldestDiaryIndex - 1, oldestDiaryIndex - numberEachLoad);

}

function onloadSelf() {
    let currentUser = localStorage.getItem(userKey);
    if (currentUser == undefined) {
        window.alert("请在右上角输入账户地址，之后刷新即可");
        return;
    }
    getDiariesByWriter(currentUser);

}

function refreshSelf() {
    //TODO : only get new diaries
    onloadSelf();
}

function onloadUserDiary() {
    const url = location.search;
    const index = url.indexOf("?");
    if (index !== -1) {
        const params = url.substr(index + 1);
        if (Account.isValidAddress(params)) {
            $("#id_div_address")[0].innerHTML = "<h3><b>" + params + "</b> 的日记 </h3>";
            getDiariesByWriter(params);
        } else {
            window.alert("无此用户，或用户地址不合法");
        }
    } else {
        window.alert("无此用户，或用户地址不合法");
    }
    return theRequest;
}

// publish diary without encoded
function publishDiaryWO() {
    const isEncoded = false;
    let content = $("#id_textarea_newdiary").val();
    content = content.replaceAll('\n','\\n');

    publishDiary(content, isEncoded);
    // $("#id_textarea_newdiary").val("");

}

function encodeDiary() {

    const srcContent = $("#id_textarea_newdiary").val();
    const key = $("#id_input_encodekey").val();
    const encodedContent = AesCtr.encrypt(srcContent, key, 256);
    $("#id_div_encoded")[0].innerText = encodedContent;
    $("#id_div_encoded").show();
    $("#id_btn_encodedPushlish").removeAttr("disabled");
}

function encodedPublish() {
    const isEncoded = true;
    const encodedContent = $("#id_div_encoded")[0].innerText;
    $("#id_div_encoded").hide();
    publishDiary(encodedContent, isEncoded);
    // $("#id_textarea_newdiary").val("");
    // $("#id_input_encodekey").val("");
    $('#id_div_noencode').show();
    $('#id_form_encode').hide();
}
function afterPublish(resp) {
    console.log("resp: " + JSON.stringify(resp));
    window.alert("日志已发送，正在等待进链，请稍后。");
}

function onloadAllUsers() {
    getAllUsersDiaryCount();
}

function refreshAllUsers() {
    onloadAllUsers();
}

function getLastDiaries(number) {
    const callArgs = '["' + number + '"]';
    simulateCall(contractAdd, 0, scGetLastDiaries, callArgs, showDiaries)
}

function getDiariesByIndex(start, end) {
    const callArgs = '["' + start + '","' + end + '"]';
    simulateCall(contractAdd, 0, scGetDiarybyIndex, callArgs, showDiaries)
}

// function getSelfDiaries() {
//     simulateCall(contractAdd, 0, scGetSelf, "[]", showDiaries)
// }

function getDiariesByWriter(writer) {
    const callArgs = '["' + writer + '"]';
    simulateCall(contractAdd, 0, scGetByWriter, callArgs, showDiariesOfSomeone)
}

function getAllUsersDiaryCount() {
    simulateCall(contractAdd, 0, scGetAllUsersDiaryCount, "[]", showAllUsersDiaryCount)
}

function publishDiary(content, isEncoded) {
    const callArgs = '["' + content + '","' + isEncoded + '"]';
    callContract(contractAdd, 0, scAddDiary, callArgs, afterPublish)
}

function simulateCall(to, value, callFunction, callArgs, listener) {
    console.log("=======================" + to + value + callFunction + callArgs);
    nebPay.simulateCall(to, value, callFunction, callArgs, {
        //callback:callbackUrl, //don't need to set callback for simulateCall
        listener: listener  //set listener for extension transaction result
    });
}

function callContract(to, value, callFunction, callArgs, listener) {
    console.log("=======================" + to + value + callFunction + callArgs);
    serialNumber = nebPay.call(to, value, callFunction, callArgs, {

        callback: callbackUrl,
        listener: listener  //set listener for extension transaction result
    });
    // setTimeout(() => {
    //     onrefreshClick();
    // }, 1000);
}

// function onrefreshClick() {
//     nebPay.queryPayInfo(serialNumber,{callback: callbackUrl})   //search transaction result from server (result upload to server by app)
//         .then(function (resp) {
//             document.getElementById('result').value = resp;
//         })
//         .catch(function (err) {
//             console.log(err);
//         });
// }