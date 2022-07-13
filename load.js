$("#game-details-play-button-container").html(`
<div style="padding-right: 5px" class="btn-full-width">
    <button id="play" type="button" class="btn-full-width btn-common-play-game-lg btn-primary-md btn-min-width" data-testid="play-button">
        <span class="icon-common-play"></span>
    </button>
</div>
<div id="bruhLetsGoAlts">
    <button id="playAlt" type="button" class="btn-common-play-game-lg btn-primary-md" style="background-color: #747474">
        <span class="icon-nav-profile" style="background-position: -36px -215px;"></span>
    </button>
</div>
`)

let descriptionCope = $(".remove-panel.btr-description")
$(".col-xs-12.btr-game-main-container.section-content").addClass("rbx-tabs-horizontal")
$(".col-xs-12.btr-game-main-container.section-content").after(`
<div class="col-xs-12 btr-game-main-container section-content rbx-tabs-horizontal">
    <div class="btr-description">
        <div style="padding-bottom: 15px;">
            <p style="padding-bottom: 10px; font-size: 5px;">Note: make sure to login before save/update the account/s</p>
            <button id="saveNow" class="btn-more btn-control-xs btn-primary-md" style="font-size: 13px">Save This Account</button>
            <button id="importCookie" class="btn-more btn-control-xs btn-primary-md" style="font-size: 13px">Import From Cookie</button>
        </div>
        <div id="AltsDisplay" style="overflow-y: auto;height: 265px;">

        </div>
    </div>
</div>

<div class="col-xs-12 btr-game-main-container section-content">
    <div class="remove-panel btr-description">
        ${descriptionCope.html()}
    </div>
</div>
`);
descriptionCope.remove();

(async () => {
    let storagedData = await chrome.storage.local.get()
    async function refrash() {
        for (let i = 0; i < storagedData.accounts.length; i++) {
            const data = storagedData.accounts[i];
            if (!data || !data.image) continue

            $("#AltsDisplay").append(`
            <div class="border-bottom" style="display: flex; align-items: center; padding: 10px">
                <div>
                    <span class="avatar avatar-headshot-sm player-avatar" style="display: block; width: 60px; height: 60px">
                        <span class="thumbnail-2d-container avatar-card-image">
                            <img class="" src="${data.image}" alt="" title="">
                        </span>
                    </span>
                </div>
                <p style="text-align: left; margin: 10px">@${data.name}</p>
                <div style="display: flex; margin-left: auto; flex-direction: column; height: 110px; justify-content: space-between;">
                    <button id="${data.id}" class="btn-more btn-control-xs btn-primary-md btn-min-width" style="font-size: 13px; background-color: #ff7100">Join</button>
                    <button id="${data.id}" class="btn-more btn-control-xs btn-primary-md btn-min-width" style="font-size: 13px">Login</button>
                    <button id="${data.id}" class="btn-more btn-control-xs btn-primary-md btn-min-width" style="font-size: 13px">Update</button>
                    <button id="${data.id}" class="btn-more btn-control-xs btn-primary-md btn-min-width" style="font-size: 13px; background-color: #ff4100">Delete</button>
                </div>
            </div>
            `)
        }
    }

    refrash()

    $("#saveNow").click(async () => {
        let selfdata = await fetch("https://users.roblox.com/v1/users/authenticated", {
            method: "GET",
            credentials: "include",
        }).then(dV => dV.json())

        if (storagedData.accounts.find(user => user && user.id == selfdata.id)) return

        let pfp = await fetch(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${selfdata.id}&size=150x150&format=Png&isCircular=false`).then(dV => dV.json())
        
        $("#AltsDisplay").append(`
        <div class="border-bottom" style="display: flex; align-items: center; padding: 10px">
            <div>
                <span class="avatar avatar-headshot-sm player-avatar" style="display: block; width: 60px; height: 60px">
                    <span class="thumbnail-2d-container avatar-card-image">
                        <img class="" src="${pfp.data[0].imageUrl}" alt="" title="">
                    </span>
                </span>
            </div>
            <p style="text-align: left; margin: 10px">@${selfdata.name}</p>
            <div style="display: flex; margin-left: auto; flex-direction: column; height: 110px; justify-content: space-between;">
                <button id="${selfdata.id}" class="btn-more btn-control-xs btn-primary-md btn-min-width" style="font-size: 13px; background-color: #ff7100">Join</button>
                <button id="${selfdata.id}" class="btn-more btn-control-xs btn-primary-md btn-min-width" style="font-size: 13px">Login</button>
                <button id="${selfdata.id}" class="btn-more btn-control-xs btn-primary-md btn-min-width" style="font-size: 13px">Update</button>
                <button id="${selfdata.id}" class="btn-more btn-control-xs btn-primary-md btn-min-width" style="font-size: 13px; background-color: #ff4100">Delete</button>
            </div>
        </div>
        `)

        storagedData.accounts.push({
            id: selfdata.id,
            name: selfdata.name,
            cookie: await chrome.runtime.sendMessage({type: "get"}),
            image: pfp.data[0].imageUrl
        })
        save(storagedData)
    })

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    $("#AltsDisplay").on("click", ".btn-more", function () {
        if ($(this).html() == "Join") {
            (async () => {
                let account = storagedData.accounts.find(user => user && user.id.toString() == $(this).attr("id"))
                let oldcookie = await chrome.runtime.sendMessage({type: "get"})
                if (!oldcookie) {
                    if (document.cookie.split(".ROBLOSECURITY=")[1]) {
                        oldcookie = document.cookie.split(".ROBLOSECURITY=")[1].split(";")[0]
                    } else {
                        return
                    }
                }

                if (account) {
                    $(".dialog").remove()
                    await chrome.runtime.sendMessage({type: "set", value: account.cookie})
                    await chrome.runtime.sendMessage({type: "join"})
                    await sleep(2500)
                    await chrome.runtime.sendMessage({type: "set", value: oldcookie})
                }
            })()
        }

        if ($(this).html() == "Login") {
            (async () => {
                let account = storagedData.accounts.find(user => user && user.id.toString() == $(this).attr("id"))

                if (account) {
                    await chrome.runtime.sendMessage({type: "set", value: account.cookie})
                    location.reload()
                }
            })()
        }
    })
})

(() => {
    let xtoken = ""

    async function login(username, password, token, id) {
        let d = await fetch("https://auth.roblox.com/v2/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-csrf-token": xtoken,
                "cookie": ''
            },
            credentials: "include",
            body: JSON.stringify({
                captchaId: id,
                captchaToken: token,
                ctype: "Username",
                cvalue: username,
                password: password
            })
        })
        if (d.headers.get("x-csrf-token")) {
            xtoken = d.headers.get("x-csrf-token")
        }
        return { src: d, json: await d.json()}
    }

    $("#play").click(function () {
        chrome.runtime.sendMessage({type: "join"})
    })

    $("#bruhLetsGoAlts").click(async () => {
        $(".dialog")?.remove()
        $("#rbx-body").append(`
        <div role="bruh" class="dialog">
            <div class="fade modal-backdrop in"></div>
                <div role="bruh" tabindex="-1" class="fade modal-modern modal-modern-challenge-captcha in modal" style="display: block;">
                    <div class="modal-dialog">
                        <div class="modal-content" role="document">
                            <div class="modal-body">
                                <button type="button" class="challenge-captcha-close-button">
                                    <span id="close-captcha" class="icon-close"></span>
                                </button>
                                <div class="challenge-captcha-body" id="challenge-captcha-element">
                                    <div id="FunCaptchaMain">
                                        <p>Loading...</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`)

        $("#close-captcha").click(function () {
            $(".dialog").remove()
        })

        // await chrome.runtime.sendMessage({type: "set", value: ""})
        // window.onbeforeunload = function(){
        //     return 'Are you sure you want to leave?';
        // };
        
        // $(".modal-body").attr("min-width", "1200px")
        // $("#FunCaptchaMain").html(`
        // <iframe frameborder="0" scrolling="yes" style="width: 1200px; height: 700px;" src="https://roblox.com/login">
        
        // </iframe>
        // `)

        // new FunCaptcha({
        //     public_key: "476068BF-9607-4799-B53D-966BE98E2B81",
        //     target_html: "dummy",
        //     callback() {
        //         console.log("YES")
        //         console.log($("#verification-token").val())
        //     }
        // })

        // await chrome.runtime.sendMessage({type: "login"})

        // return

        let oldcookie = await chrome.runtime.sendMessage({type: "get"})
        if (!oldcookie) {
            if (document.cookie.split(".ROBLOSECURITY=")[1]) {
                oldcookie = document.cookie.split(".ROBLOSECURITY=")[1].split(";")[0]
            } else {
                return
            }
        }

        let d = await fetch("https://fern.wtf/api/funfun").then(dV => dV.json())
        if (d.errors) {
            $("#FunCaptchaMain").html(`<p>Captcha api error 01<br><br>Try again later!</p>`)
            return
        }

        let account = await fetch("https://fern.wtf/api/getaccount").then(dV => dV.json()).catch(err => console.log(err))
        if (!account) return
        account = account.combo
        
        $("#FunCaptchaMain").html(`<iframe frameborder="0" scrolling="no" id="fc-iframe-wrap" class="fc-iframe-wrap" aria-label=" " style="width: 308px; height: 310px;" src="${d.url}"></iframe>`)

        function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        window.addEventListener("message", async event => {
            if (event.data && event.data == "complete") {
                $("#FunCaptchaMain").html(`<p>Loading...</p>`)

                await chrome.runtime.sendMessage({type: "set", value: ""})
                await sleep(1000)
                
                let test = await login(account.split(":")[0], account.split(":")[1])
                test = await login(account.split(":")[0], account.split(":")[1])
                let captchaId = JSON.parse(test.json.errors[0].fieldData).unifiedCaptchaId
        
                AccountTest = await login(account.split(":")[0], account.split(":")[1], d.token.token, captchaId)
                console.log(AccountTest)
        
                if (!AccountTest.json.errors && !AccountTest.json.isBanned) {
                    $(".dialog").remove()
                    await chrome.runtime.sendMessage({type: "join"})

                    let pfp = await fetch(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${AccountTest.json.user.id}&size=150x150&format=Png&isCircular=false`).then(dV => dV.json())
                    let newcookie = await chrome.runtime.sendMessage({type: "get"})
                    if (!newcookie) {
                        if (document.cookie.split(".ROBLOSECURITY=")[1]) {
                            newcookie = document.cookie.split(".ROBLOSECURITY=")[1].split(";")[0]
                        } else {
                            return
                        }
                    }

                    storagedData.accounts.push(storagedData.accounts, {
                        id: AccountTest.json.user.id,
                        name: AccountTest.json.user.name,
                        cookie: newcookie,
                        image: pfp.data[0].imageUrl
                    })
                    chrome.storage.local.set(storagedData)

                    await sleep(2500)
                } else {
                    console.log("Failed")
                    $("#FunCaptchaMain").html(`<p>Account Banned<br><br>Try again later!</p>`)
                }
                
                console.log("Setting...")
                await chrome.runtime.sendMessage({type: "set", value: oldcookie})
                console.log("Done!")
            }
        })
    })
})()