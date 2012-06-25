// PLUGIN_INFO {{ =========================================================== //

const PLUGIN_INFO =

<KeySnailPlugin>
    <name>Gnail</name>
    <description>Check for Gmail</description>
    <description lang="ja">Gmail の新着チェック</description>
    <version>1.0.1</version>
    <updateURL>https://raw.github.com/daic-h/keysnail_plugin/master/gnail.ks.js</updateURL>
    <iconURL></iconURL>
    <author homepage="http://a-newcomer.com">Daic_h</author>
    <license>MIT</license>
    <include>main</include>

    <detail lang="ja"><![CDATA[
==== 機能 ====

Gmailの新着メールをKeySnailから操作します。

==== キーバインド ====
キーバインドの例：
>||
key.setViewKey(["C-x", "C-m"], function (ev, arg) {
    ext.exec("list-new-mail");
}, '新着メールを一覧表示', true);

key.setViewKey(["C-x", "C-l"], function (ev, arg) {
    ext.exec("list-label-of-gmail");
}, '新着メールをラベルから選択', true);
||<

==== カスタマイズ ====

新着メール確認の更新時間は、次のようにして変更することが可能です(秒)

>||
plugins.options["gnail.interval"] = 30;
||<


確認するラベルは、次のように追加することが可能です

>||
plugins.options["gnail.labels"] = ['inbox', 'work', 'notice'];
||<


メインでチェックするラベルは、次のようにして変更することが可能です

>||
plugins.options["gnail.default"] = 'work';
||<
]]></detail>
</KeySnailPlugin>;

// }} ======================================================================= //

let pOptions = plugins.setupOptions("gnail", {
    "default": {
        preset: 'inbox',
        description: M({
            ja: "メインでチェックするラベル、デフォルト値:'inbox' (受信トレイ)",
            en: "hogehoge"
        })
    },
    "labels": {
        preset: ['inbox'],
        description: M({
            ja: "更新を選択するラベルのリスト、デフォルト値:['inbox'] (受信トレイ)",
            en: "hogehoge"
        })
    },
    "interval" : {
        preset: 60,
        description: M({
            ja: "新着メールの更新期間(秒)、デフォルト値:60",
            en: "hogehoge"
        })
    },
    'keymap': {
        preset: {
            "C-z"   : "prompt-toggle-edit-mode",
            "SPC"   : "prompt-next-page",
            "b"     : "prompt-previous-page",
            "j"     : "prompt-next-completion",
            "k"     : "prompt-previous-completion",
            "g"     : "prompt-beginning-of-candidates",
            "G"     : "prompt-end-of-candidates",
            "q"     : "prompt-cancel",
            // gnail specific actions
            "o"     : "opened-by-gmail"
        },
        description: M({
            ja: "メイン画面の操作用キーマップ",
            en: "Local keymap for manipulation"
        })
    }
}, PLUGIN_INFO);

let StatusPanel = function(){
    const ICON_E = 'data:image/png;base64,' +
                   'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAhklEQVQ4y9WQsQ3AIBADGYtZ2IZp'+
                   '2IBhUtKlTZfqwyNAhvyjpIpiyRX2YTDmc23WUvPhPZ0hLM0Z7AwANsVIqvLZnDd4++6cDqllzuCK'+
                   'DmCpkKnMEgEiRCgvAVxAyFCGVTIgpfLTCMFyOcsZGdDKNdCeg7MxcwPMZVUVIi54LG3BG3fA/3UB'+
                   '6Ygi+4dDfeoAAAAASUVORK5CYII=';

    const ICON_D = 'data:image/png;base64,' +
                   'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAgElEQVQ4y9WQwQ3AIAwDM24GYRIW'+
                   'YYBswhJUrhTk0gS1r6qW/MI+DCKfS1WHu9Y6WmtbI8OdCwA2s5EJZ2te+PZSSgrxMjK8YgKgDLKW'+
                   'oRAQQaLyFoACQ7jMq0JA7/38aYZwGWfIhAAve8Cfw7M5cwOs5UwOCRc8VbrgjSfg/zoAVNwbywPd'+
                   'RZsAAAAASUVORK5CYII=';

    const CONTAINER_ID = 'keysnail-gnail-status-panel';

    var container = document.getElementById(CONTAINER_ID);

    if (container)
        container.parentNode.removeChild(container);
    container = document.createElement('statusbarpanel');
    container.setAttribute('id', CONTAINER_ID);
    container.setAttribute('align', 'center');

    var box = document.createElement('hbox');
    box.setAttribute('align', 'center');
    box.setAttribute('flex', 1);

    var icon = document.createElement('image');
    icon.setAttribute('flex', 1);
    icon.setAttribute('src', ICON_D);

    var label = document.createElement('label');
    label.setAttribute('style', 'font-weight:bold; color: #383838;');
    label.setAttribute('flex', 1);
    label.setAttribute('value', '-');
    
    box.appendChild(icon);
    box.appendChild(label);
    
    box.addEventListener("click", function(e) ext.exec('list-new-mail'), false);
    container.appendChild(box);
    document.getElementById('status-bar').insertBefore(
        container, document.getElementById('keysnail-status').nextSibling
    );

    return {
        update: function(count) {
            icon.setAttribute('src', count > 0 ? ICON_E : ICON_D);
            label.setAttribute('value', count);            
        }
    };
}();

let PasswordManager = function () {
    var form = ['https://www.google.com', 'https://www.google.com', null];
    var PasswordManager = Cc["@mozilla.org/login-manager;1"].getService(Ci.nsILoginManager);
    var logins = PasswordManager.findLogins({}, form[0], form[1], form[2]);

    var isLogin = function () {
        return logins.length;
    };
    
    return {
        isLogin: isLogin,

        username: function() {
            return isLogin() ? logins[0].username : '';
        }(),

        password: function() {
            return isLogin() ? logins[0].password : '';
        }(),

        loginWithPrompt: function () {
            prompt.read("user_name: ", function (user_name) {
                if (!user_name) return;
         
                prompt.read("password: ", function (password) {
                    if (!password) return;
         
                    var nsLoginInfo =
                        new Components.Constructor("@mozilla.org/login-manager/loginInfo;1", Ci.nsILoginInfo, "init");
                    var formLoginInfo =
                        new nsLoginInfo(form[0], form[1], form[2], user_name, password, '', '');
         
                    PasswordManager.addLogin(formLoginInfo);
                });
            });
        }
    };
}();

let Gnail = function () {
    function toLocalizeDate(issued) {
        var d = new Date(issued);
        return d.toLocaleString();
    }

    function getNewFeed(label) {
        let url = 'https://mail.google.com/mail/feed/atom';
        if (label) 
            url = url + '/' + label;
        
        let xhr = new XMLHttpRequest();
        xhr.mozBackgroundRequest = true;
        xhr.open(
            "GET",
            url,
            false,
            PasswordManager.username,
            PasswordManager.password
        );
        xhr.send(null);
        let response = xhr.responseXML;
        
        return response;
    }

    function listNewMail(label) {
        if(!PasswordManager.isLogin) {
            PasswordManager.loginWithPrompt();
            return;
        }

        let response = getNewFeed(label);
        if (response) {
            let collection = [];
            let title = response.getElementsByTagName('title')[0].textContent;
            let entries = Array.slice(response.getElementsByTagName('entry'));
            entries.forEach(function(entry){
                collection.push([
                    entry.getElementsByTagName('name')[0].textContent,
                    entry.getElementsByTagName('title')[0].textContent,
                    entry.getElementsByTagName('summary')[0].textContent,
                    toLocalizeDate(entry.getElementsByTagName('issued')[0].textContent),
                    entry.getElementsByTagName('link')[0].getAttribute('href')
                ]);
            });
            if (collection.length){
                prompt.selector({
                    message    : title + ':',
                    collection : collection,
                    flags      : [0, 0, 0, 0, HIDDEN | IGNORE],
                    style      : [0, 0, style.prompt.description, 0],
                    header     : ['From', 'Title', 'Summary', 'Date'],
                    width      : [20, 20, 40, 20],
                    keymap     : pOptions['keymap'],
                    actions    : [
                        [function(aIndex, collection) {
                             openUILinkIn(collection[aIndex][4], 'tab');
                         }, M({ja: 'メールをGmailで開く', en: 'Open Mail by Gmail'}),
                        'opened-by-gmail']
                    ]
                });
            } else {
                display.echoStatusBar(M({ja: '新着メッセージはありません', en: "No mail found"}), 2000);
                return;
            }
        }
    }

    return {
        listNewMail: function (aEvent, aArg) {
            listNewMail(pOptions['default']);
            return;
        },

        listLabelOfGmail: function (aEvent, aArg) {
            prompt.selector({
                message    : 'labels:',
                collection : pOptions['labels'],
                flags      : [0],
                style      : [0],
                header     : ['Label'],
                width      : [20],
                callback   : function (aIndex, collection) {
                    listNewMail(collection[aIndex]);
                }
            });
        },

        checkNewMail: function () {
            if (PasswordManager.isLogin) {
                let response = getNewFeed(pOptions['default']);
                let entries = Array.slice(response.getElementsByTagName('entry'));
                let count = entries.length;
                StatusPanel.update(count);
            }
            setTimeout(Gnail.checkNewMail, pOptions['interval'] * 1000);
        }
    };
}();
Gnail.checkNewMail();

plugins.withProvides(function (provide) {
    provide("list-new-mail", Gnail.listNewMail,
        M({ja: '新着メールを一覧表示', en: 'List new mail'})
    );

    provide("list-label-of-gmail", Gnail.listLabelOfGmail,
        M({ja: '新着メールをラベルから選択', en: 'List label of Gmail'})
    );
}, PLUGIN_INFO);

