const vscode = require('vscode');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

    // console.log('Congratulations, your extension "vscode-plugin-kratos" is now active!');
    const provider = vscode.languages.registerCompletionItemProvider("ini", { provideCompletionItems, resolveCompletionItem },
        ".", "=", ",",
        "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",
        "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
        "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"
    );

    context.subscriptions.push(provider);
}

function deactivate() {
    // console.log('your extension "vscode-plugin-kratos" is deactive!');
}

/**
 * @param label 选项
 * @param body 代码
 * @param detail 描述标题
 * @param codes 描述内容ini代码
 */
function makeCompletionItem(label, body, detail, codes) {
    const snippetCompletion = new vscode.CompletionItem(label);
    snippetCompletion.insertText = new vscode.SnippetString(body);
    if (!isNullOrEmpty(detail)) {
        snippetCompletion.detail = detail;
    } else {
        snippetCompletion.detail = label;
    }
    let codesmd = new vscode.MarkdownString();
    if (codes) {
        codes.forEach(element => {
            codesmd.appendCodeblock(element, "ini");
        });
        codesmd.appendText(" ");
    }
    snippetCompletion.documentation = codesmd;
    return snippetCompletion;
}

function makeCompletionItemFromSection(section) {
    let res = new Set();
    const trailTypes = readAllValueFromSection(section);
    trailTypes.forEach((v, i, o) => {
        const t = v[1];
        if (!isNullOrEmpty(t)) {
            res.add(makeCompletionItem(v[1], v[1], null));
        }
    });
    console.log(section, " size " + res.size);
    return Array.from(res);
}

function readAllValueFromSection(section) {
    let array = Array();
    vscode.workspace.textDocuments.forEach((doc, index, list) => {
        if (vscode.languages.match("ini", doc)) {
            array = array.concat(readValueFromSection(doc, section));
        }
    });
    return array;
}

function readValueFromSection(document, section) {
    let find = false;
    let array = Array();
    for (let i = 0; i < document.lineCount; i++) {
        const line = document.lineAt(i);
        const text = line.text.trim();
        // 找到目标section
        if (text.startsWith("[" + section + "]")) {
            find = true;
            continue;
        }
        if (find) {
            if (text.startsWith("[")) {
                // 结束查找
                break;
            }
            else if (!text.startsWith(";") && text.indexOf("=") != -1) {
                // 读取内容
                let k = text.slice(0, text.indexOf("="));
                let v = text.slice(text.indexOf("=") + 1);
                if (v.indexOf(";") != -1) {
                    v = v.slice(0, v.indexOf(";"));
                }
                array.push(Array(k.trim(), v.trim()));
            }
        }
    }
    return array;
}

function isNullOrEmpty(str) {
    return str == 'undefined' || !str || !/[^\s]/.test(str);
}

/**
 * 自动提示实现，这里模拟一个很简单的操作
 * 当输入 this.dependencies.xxx时自动把package.json中的依赖带出来
 * 当然这个例子没啥实际意义，仅仅是为了演示如何实现功能
 * @param {*} document 
 * @param {*} position 
 * @param {*} token 
 * @param {*} context 
 */
// @ts-ignore
function provideCompletionItems(document, position, token, context) {

    const line = document.lineAt(position);
    // 只截取到光标位置为止，防止一些特殊情况
    const lineText = line.text.substring(0, position.character);
    console.log(lineText);
    let res = new Array();

    const dive = [
        "[AircraftType]",
        "Dive=yes",
        "Dive.Distance=10 ;距离多少格开始降低高度",
        "Dive.Speed=1 ;每次调整高度的量",
        "Dive.Delay=0 ;多少帧调整一次高度",
        "Dive.FlightLevel=300 ;距离地面的高度",
        "Dive.PullUpAfterFire=no ;发射武器后即刻停止调整高度"
    ];
    // 俯冲
    if (/^D[ive]{0,3}$/g.test(lineText)) {
        res.push(makeCompletionItem("Dive", "Dive", "飞行器俯冲", dive));
        res.push(makeCompletionItem("Dive=yes", "Dive=yes ;启用飞行器俯冲", "启用飞行器俯冲", dive));
        res.push(makeCompletionItem("Dive.Distance", "Dive.Distance=${1:10} ;距离多少格开始降低高度", "距离多少格开始降低高度", dive));
        res.push(makeCompletionItem("Dive.Speed", "Dive.Speed=${1:1} ;每次调整高度的量", "每次调整高度的量", dive));
        res.push(makeCompletionItem("Dive.Delay", "Dive.Delay=${1:0} ;多少帧调整一次高度", "多少帧调整一次高度", dive));
        res.push(makeCompletionItem("Dive.FlightLevel", "Dive.FlightLevel=${1:300} ;距离地面的高度", "距离地面的高度", dive));
        res.push(makeCompletionItem("Dive.PullUpAfterFire", "Dive.PullUpAfterFire=${1:no} ;发射武器后即刻停止调整高度", "发射武器后即刻停止调整高度", dive));
    }
    if (/^Dive\=/g.test(lineText)) {
        res.push(makeCompletionItem("yes", "yes ;启用飞行器俯冲", "启用飞行器俯冲", dive));
    }
    if (/^Dive\./g.test(lineText)) {
        res.push(makeCompletionItem("Distance", "Distance=${1:10} ;距离多少格开始降低高度", "距离多少格开始降低高度", dive));
        res.push(makeCompletionItem("Speed", "Speed=${1:1} ;每次调整高度的量", "每次调整高度的量", dive));
        res.push(makeCompletionItem("Delay", "Delay=${1:0} ;多少帧调整一次高度", "多少帧调整一次高度", dive));
        res.push(makeCompletionItem("FlightLevel", "FlightLevel=${1:300} ;距离地面的高度", "距离地面的高度", dive));
        res.push(makeCompletionItem("PullUpAfterFire", "PullUpAfterFire=${1:no} ;发射武器后即刻停止调整高度", "发射武器后即刻停止调整高度", dive));
    }

    const AntiMissile = [
        "[TechnoType]",
        "AntiMissile.Enable=yes",
        "AntiMissile.OneShotOneKill=yes ;一击必杀",
        "AntiMissile.Harmless=no ;和平处置，抛射体不会炸",
        "AntiMissile.Self=yes ;单位自身反抛射体",
        "AntiMissile.ForPassengers=no ;使用乘客反抛射体，结合上一条",
        "AntiMissile.ScanAll=no ;是否扫描范围内的所有抛射体，还是只反瞄准自身的抛射体",
        "AntiMissile.Range=0 ;扫描抛射体的范围，单位格",
        "AntiMissile.EliteRange=0 ;精英级扫描抛射体的范围，单位格",
        "AntiMissile.Rate=15 ;扫描的频率，越大越慢"
    ];
    // 反抛射体
    if (/^A[ntiMissile]{0,10}$/g.test(lineText)) {
        res.push(makeCompletionItem("AntiMissile", "AntiMissile", "反抛射体扫描", AntiMissile));
        res.push(makeCompletionItem("AntiMissile.Enable", "AntiMissile.Enable=${1:yes} ;启用反抛射体扫描", "启用反抛射体扫描", AntiMissile));
        res.push(makeCompletionItem("AntiMissile.OneShotOneKill", "AntiMissile.OneShotOneKill=${1:yes} ;一击必杀", "一击必杀", AntiMissile));
        res.push(makeCompletionItem("AntiMissile.Harmless", "AntiMissile.Harmless=${1:no} ;和平处置，抛射体不会炸", "和平处置，抛射体不会炸", AntiMissile));
        res.push(makeCompletionItem("AntiMissile.Self", "AntiMissile.Self=${1:yes} ;单位自身反抛射体", "单位自身反抛射体", AntiMissile));
        res.push(makeCompletionItem("AntiMissile.ForPassengers", "AntiMissile.ForPassengers=${1:no} ;使用乘客反抛射体", "使用乘客反抛射体", AntiMissile));
        res.push(makeCompletionItem("AntiMissile.ScanAll", "AntiMissile.ScanAll=${1:no} ;是否扫描范围内的所有抛射体，还是只反瞄准自身的抛射体", "是否扫描范围内的所有抛射体，还是只反瞄准自身的抛射体", AntiMissile));
        res.push(makeCompletionItem("AntiMissile.Range", "AntiMissile.Range=${1:0} ;扫描抛射体的范围，单位格", "扫描抛射体的范围，单位格", AntiMissile));
        res.push(makeCompletionItem("AntiMissile.EliteRange", "AntiMissile.EliteRange=${1:0} ;精英级扫描抛射体的范围，单位格", "精英级扫描抛射体的范围，单位格", AntiMissile));
        res.push(makeCompletionItem("AntiMissile.Rate", "AntiMissile.Rate=${1:15} ;扫描的频率，越大越慢", "扫描的频率，越大越慢", AntiMissile));
    }
    if (/^AntiMissile\./g.test(lineText)) {
        res.push(makeCompletionItem("Enable", "Enable=${1:yes} ;启用反抛射体扫描", "启用反抛射体扫描", AntiMissile));
        res.push(makeCompletionItem("OneShotOneKill", "OneShotOneKill=${1:yes} ;一击必杀", "一击必杀", AntiMissile));
        res.push(makeCompletionItem("Harmless", "Harmless=${1:no} ;和平处置，抛射体不会炸", "和平处置，抛射体不会炸", AntiMissile));
        res.push(makeCompletionItem("Self", "Self=${1:yes} ;单位自身反抛射体", "单位自身反抛射体", AntiMissile));
        res.push(makeCompletionItem("ForPassengers", "ForPassengers=${1:no} ;使用乘客反抛射体", "使用乘客反抛射体", AntiMissile));
        res.push(makeCompletionItem("ScanAll", "ScanAll=${1:no} ;是否扫描范围内的所有抛射体，还是只反瞄准自身的抛射体", "是否扫描范围内的所有抛射体，还是只反瞄准自身的抛射体", AntiMissile));
        res.push(makeCompletionItem("Range", "Range=${1:0} ;扫描抛射体的范围，单位格", "扫描抛射体的范围，单位格", AntiMissile));
        res.push(makeCompletionItem("EliteRange", "EliteRange=${1:0} ;精英级扫描抛射体的范围，单位格", "精英级扫描抛射体的范围，单位格", AntiMissile));
        res.push(makeCompletionItem("Rate", "Rate=${1:15} ;扫描的频率，越大越慢", "扫描的频率，越大越慢", AntiMissile));
    }
    const AntiMissile2 = [
        "[ProjectileType]",
        "Interceptable=yes ;默认否"
    ]
    if (/^I[nterceptable]{0,12}$/g.test(lineText)) {
        res.push(makeCompletionItem("Interceptable", "Interceptable=${1:no} ;能否被反抛射体扫描并摧毁", "能否被反抛射体扫描并摧毁", AntiMissile2));
    }

    const AutoFireAreaWeapon = [
        "[TechnoType]",
        "AutoFireAreaWeapon=0 ;0是主武器，1是副武器",
        "AutoFireAreaWeapon.InitialDelay=0 ;初始延迟，武器发射频率按武器自身ROF计算",
        "AutoFireAreaWeapon.CheckAmmo=no ;没有弹药无法发射"
    ];
    // 自动朝脚下发射武器
    if (/^A[utoFireAreaWeapon]{0,17}$/g.test(lineText)) {
        res.push(makeCompletionItem("AutoFireAreaWeapon", "AutoFireAreaWeapon", "自动朝脚下发射武器，0是主武器，1是副武器", AutoFireAreaWeapon));
        res.push(makeCompletionItem("AutoFireAreaWeapon=num", "AutoFireAreaWeapon=${1:0} ;自动朝脚下发射武器，0是主武器，1是副武器", "自动朝脚下发射武器，0是主武器，1是副武器", AutoFireAreaWeapon));
        res.push(makeCompletionItem("AutoFireAreaWeapon.InitialDelay", "AutoFireAreaWeapon.InitialDelay=${1:0} ;初始延迟，武器发射频率按武器自身ROF计算", "初始延迟，武器发射频率按武器自身ROF计算", AutoFireAreaWeapon));
        res.push(makeCompletionItem("AutoFireAreaWeapon.CheckAmmo", "AutoFireAreaWeapon.CheckAmmo=${1:no} ;没有弹药无法发射", "没有弹药无法发射", AutoFireAreaWeapon));
    }
    if (/^AutoFireAreaWeapon\=/g.test(lineText)) {
        res.push(makeCompletionItem("0", "0 ;自动朝脚下发射武器，0是主武器，1是副武器", "自动朝脚下发射武器，0是主武器，1是副武器", AutoFireAreaWeapon));
        res.push(makeCompletionItem("1", "1 ;自动朝脚下发射武器，0是主武器，1是副武器", "自动朝脚下发射武器，0是主武器，1是副武器", AutoFireAreaWeapon));
    }
    if (/^AutoFireAreaWeapon\./g.test(lineText)) {
        res.push(makeCompletionItem("InitialDelay", "InitialDelay=${1:0} ;初始延迟，武器发射频率按武器自身ROF计算", "初始延迟，武器发射频率按武器自身ROF计算", AutoFireAreaWeapon));
        res.push(makeCompletionItem("CheckAmmo", "CheckAmmo=${1:no} ;没有弹药无法发射", "没有弹药无法发射", AutoFireAreaWeapon));
    }

    const FireSuperWeapon = [
        "[TechnoType]",
        "FireSuperWeapon.Types=NukeSpecial,IronCurtainSpecial",
        "FireSuperWeapon.Weapon=0 ;哪个武器发射时发射超级武器，0主武，1副武",
        "FireSuperWeapon.AnyWeapon=no ;任意武器发射时发射超级武器",
        "FireSuperWeapon.ToTarget=yes ;朝目标位置发射超级武器",
        "FireSuperWeapon.RealLaunch=no ;发射后超级武器进入冷却"
    ];
    // 发射武器时一并发射超级武器，强制射出，不检查冷却
    if (/^F[ireSuperWeapon]{0,14}$/g.test(lineText)) {
        res.push(makeCompletionItem("FireSuperWeapon", "FireSuperWeapon", "随武器发射的超武", FireSuperWeapon));
        res.push(makeCompletionItem("FireSuperWeapon.Types", "FireSuperWeapon.Types=$0 ;随武器发射的超武类型，可以多个", "随武器发射的超武类型，可以多个", FireSuperWeapon));
        res.push(makeCompletionItem("FireSuperWeapon.Weapon", "FireSuperWeapon.Weapon=${1:0} ;哪个武器发射时发射超级武器，0主武，1副武", "哪个武器发射时发射超级武器，0主武，1副武", FireSuperWeapon));
        res.push(makeCompletionItem("FireSuperWeapon.AnyWeapon", "FireSuperWeapon.AnyWeapon=${1:no} ;任意武器发射时发射超级武器", "任意武器发射时发射超级武器", FireSuperWeapon));
        res.push(makeCompletionItem("FireSuperWeapon.ToTarget", "FireSuperWeapon.ToTarget=${1:yes} ;朝目标位置发射超级武器", "朝目标位置发射超级武器", FireSuperWeapon));
        res.push(makeCompletionItem("FireSuperWeapon.RealLaunch", "FireSuperWeapon.RealLaunch=${1:no} ;发射后超级武器进入冷却", "发射后超级武器进入冷却", FireSuperWeapon));
    }
    if (/^FireSuperWeapon\.(.(?!\=))*$/g.test(lineText)) {
        res.push(makeCompletionItem("Types", "Types=$0 ;随武器发射的超武类型，可以多个", "随武器发射的超武类型，可以多个", FireSuperWeapon));
        res.push(makeCompletionItem("Weapon", "Weapon=${1:0} ;哪个武器发射时发射超级武器，0主武，1副武", "哪个武器发射时发射超级武器，0主武，1副武", FireSuperWeapon));
        res.push(makeCompletionItem("AnyWeapon", "AnyWeapon=${1:no} ;任意武器发射时发射超级武器", "任意武器发射时发射超级武器", FireSuperWeapon));
        res.push(makeCompletionItem("ToTarget", "ToTarget=${1:yes} ;朝目标位置发射超级武器", "朝目标位置发射超级武器", FireSuperWeapon));
        res.push(makeCompletionItem("RealLaunch", "RealLaunch=${1:no} ;发射后超级武器进入冷却", "发射后超级武器进入冷却", FireSuperWeapon));
    }
    if (/^FireSuperWeapon\.Types=/g.test(lineText)) {
        const v = makeCompletionItemFromSection("SuperWeaponTypes");
        res = res.concat(v);
    }

    const Arcing = [
        "[ProjectileType]",
        "AdvancedBallistics=yes ;高级弹道学，重新计算抛物线，Arcing将变得更精准，但与Phobos的Gravity=0冲突，二选一",
        "Arcing=yes ;精准抛物线",
        "Arcing.FixedSpeed=0 ;使用固定速度，弹道会根据距离发生高抛，速度越小抛的越高，射程越近抛的越高（Arcing不会使用Speed属性，速度通过Range计算，这条是舍弃原有初速度计算方式，不建议使用）",
        "Acceleration=0 ;速度加成，越高弹道越直，抛射高度越小，不建议超过半格，即128",
        "Inaccurate=yes ;启用随机散布",
        "BallisticScatter.Min=0 ;散布的最小距离，单位格",
        "BallisticScatter.Max=BallisticScatter ;散布的最大距离，单位格，默认值[CombatDamage]BallisticScatter"
    ];
    // 高级抛物线弹道
    if (/^A[dvancedBallistics]{0,17}$/g.test(lineText)) {
        res.push(makeCompletionItem("AdvancedBallistics", "AdvancedBallistics=${1:yes} ;启用高级弹道学，重新计算抛物线，Arcing将变得更精准，但与Phobos的Gravity=0冲突，二选一", "启用高级弹道学，重新计算抛物线，Arcing将变得更精准，但与Phobos的Gravity=0冲突，二选一", Arcing));
    }
    if (/^A[cceleration]{0,11}$/g.test(lineText)) {
        res.push(makeCompletionItem("Acceleration", "Acceleration=${1:0} ;启用高级弹道学时，弹丸的飞行速度加成，越高弹道越直，抛射高度越小，不建议超过半格，即128", "启用高级弹道学时，弹丸的飞行速度加成，越高弹道越直，抛射高度越小，不建议超过半格，即128", Arcing));
    }
    if (/^I[naccurate]{0,9}$/g.test(lineText)) {
        res.push(makeCompletionItem("Inaccurate", "Inaccurate=${1:yes} ;炮弹落点随机散布", "炮弹随机散布", Arcing));
    }
    if (/^A[rcing]{0,5}$/g.test(lineText)) {
        res.push(makeCompletionItem("Arcing", "Arcing", "抛物线弹道", Arcing));
        res.push(makeCompletionItem("Arcing=yes", "Arcing=yes ;启用高级弹道学时，精准抛物线", "启用高级弹道学时，精准抛物线", Arcing));
        res.push(makeCompletionItem("Arcing.FixedSpeed", "Arcing.FixedSpeed=${1:0} ;使用固定速度，弹道会根据距离发生高抛，速度越小抛的越高，射程越近抛的越高（Arcing不会使用Speed属性，速度通过Range计算，这条是舍弃原有初速度计算方式，不建议使用）", "高级弹道抛物线，使用固定速度，弹道会根据距离发生高抛，速度越小抛的越高，射程越近抛的越高，Arcing不会使用Speed属性，速度通过Range计算，这条是舍弃原有初速度计算方式，不建议使用", Arcing));
    }
    if (/^Arcing\=/g.test(lineText)) {
        res.push(makeCompletionItem("yes", "yes ;启用高级弹道学时，精准抛物线", "启用高级弹道学时，精准抛物线", Arcing));
    }
    if (/^Arcing\./g.test(lineText)) {
        res.push(makeCompletionItem("FixedSpeed", "FixedSpeed=${1:0} ;启用高级弹道学时，使用恒定飞行速度，弹道会根据距离发生高抛，速度越小抛的越高，射程越近抛的越高（Arcing不会使用Speed属性，速度通过Range计算，这条是舍弃原有初速度计算方式，不建议使用）", "高级弹道抛物线，使用固定速度，弹道会根据距离发生高抛，速度越小抛的越高，射程越近抛的越高，Arcing不会使用Speed属性，速度通过Range计算，这条是舍弃原有初速度计算方式，不建议使用", Arcing));
    }
    if (/^B[allisticScatter]{0,15}$/g.test(lineText)) {
        res.push(makeCompletionItem("BallisticScatter", "BallisticScatter", "散布的距离，单位格", Arcing));
        res.push(makeCompletionItem("BallisticScatter.Min", "BallisticScatter.Min=${1:0} ;散布的最小距离，单位格", "散布的最小距离，单位格", Arcing));
        res.push(makeCompletionItem("BallisticScatter.Max", "BallisticScatter.Max=${1:2} ;散布的最大距离，单位格，默认值[CombatDamage]BallisticScatter", "散布的最大距离，单位格，默认值[CombatDamage]BallisticScatter", Arcing));
    }
    if (/^BallisticScatter\./g.test(lineText)) {
        res.push(makeCompletionItem("Min", "Min=${1:0} ;散布的最小距离，单位格", "散布的最小距离，单位格", Arcing));
        res.push(makeCompletionItem("Max", "Max=${1:2} ;散布的最大距离，单位格，默认值[CombatDamage]BallisticScatter", "散布的最大距离，单位格，默认值[CombatDamage]BallisticScatter", Arcing));
    }

    const ROT = [
        "[ProjectileType]",
        "ROT=1 ;直线弹道，会撞高地，会撞悬崖",
        "Straight=yes ;非ROT=1强制启用直线弹道",
        "AbsolutelyStraight=no ;绝对直线，不朝目标点移动而是朝向单位正前方移动（御雷机甲），强制启用触碰引信",
        "Proximity=yes ;启用触碰引信，抛射体与地面非友军任意目标处于同一个格子时引爆",
        "CourseLockDuration=0 ;安全距离，单位帧",
        "; 触碰引信详细设置",
        "Proximity.Force=no ;强制启用碰撞引信",
        "Proximity.Arm=128 ;检测的距离，球型半径，单位Lepton，一格是256",
        "Proximity.ZOffset=104 ;检测的高度偏移，单位Lepton，一格高度是208，单位的0点在脚下，坐标加上偏移值，再检测，穿过建筑以Height加上偏移计算碰撞",
        "Proximity.AffectsOwner=no ;碰触发射者同阵营单位",
        "Proximity.AffectsAllies=no ;碰触友军",
        "Proximity.AffectsEnemies=yes ;碰触敌人",
        "; 侵彻",
        "Proximity.Penetration=no ;启用碰撞引信时，检测到碰撞是否穿透，yes时，启用下面的设置",
        "Proximity.PenetrationWarhead=ApocAP ;启用碰撞引信时，对穿透的目标造成伤害的弹头，默认为自身弹头",
        "Proximity.PenetrationWeapon=RedEye2 ;启用碰撞引信时，对穿透的目标发射额外的武器，覆盖上一条",
        "Proximity.PenetrationTimes=-1 ;引爆多少次后销毁",
        "Proximity.PenetrationBuildingOnce=no ;每个格子检测一次，建筑多格会收到多次伤害，yes时，只穿透一次",
    ];
    // 直线导弹
    if (/^R[OT]{0,2}$/g.test(lineText)) {
        res.push(makeCompletionItem("ROT", "ROT", "导弹", ROT));
        res.push(makeCompletionItem("ROT=1", "ROT=1 ;导弹转弯系数，0=抛物线，1=直线弹道", "导弹转弯系数，0=抛物线，1=直线弹道", ROT));
    }
    if (/^ROT\=/g.test(lineText)) {
        res.push(makeCompletionItem("0", "0 ;抛物线弹道", "抛物线弹道", ROT));
        res.push(makeCompletionItem("1", "1 ;直线弹道", "直线弹道", ROT));
        res.push(makeCompletionItem("30", "${1:30}", "追踪弹道", ROT));
    }
    if (/^S[traight]{0,7}$/g.test(lineText)) {
        res.push(makeCompletionItem("Straight", "Straight=${1:yes} ;非ROT=1强制启用直线弹道", "非ROT=1强制启用直线弹道", ROT));
    }
    if (/^A[bsolutelyStraight]{0,17}$/g.test(lineText)) {
        res.push(makeCompletionItem("AbsolutelyStraight", "AbsolutelyStraight=${1:no} ;绝对直线，不朝目标点移动而是朝向单位正前方移动（御雷机甲），强制启用触碰引信", "绝对直线，不朝目标点移动而是朝向单位正前方移动（御雷机甲），强制启用触碰引信", ROT));
    }
    if (/^C[ourseLockDuration]{0,17}$/g.test(lineText)) {
        res.push(makeCompletionItem("CourseLockDuration", "CourseLockDuration=${1:0} ;延迟锁定，单位帧，启用碰撞时为安全时间", "延迟锁定，单位帧，启用碰撞时为安全时间", ROT));
    }
    // 碰撞
    if (/^P[roximity]{0,8}$/g.test(lineText)) {
        res.push(makeCompletionItem("Proximity", "Proximity", "触碰引信", ROT));
        res.push(makeCompletionItem("Proximity=yes", "Proximity=yes ;启用触碰引信，抛射体与地面非友军任意目标处于同一个格子时引爆", "启用触碰引信，抛射体与地面非友军任意目标处于同一个格子时引爆", ROT));
    }
    if (/^Proximity\=/g.test(lineText)) {
        res.push(makeCompletionItem("yes", "yes ;启用触碰引信，抛射体与地面非友军任意目标处于同一个格子时引爆", "启用触碰引信，抛射体与地面非友军任意目标处于同一个格子时引爆", ROT));
    }
    if (/^Proximity\.(.(?!\=))*$/g.test(lineText)) {
        res.push(makeCompletionItem("Force", "Force=${1:no} ;强制启用碰撞引信", "强制启用碰撞引信", ROT));
        res.push(makeCompletionItem("Arm", "Arm=${1:128} ;检测的距离，球型半径，单位Lepton，一格是256", "检测的距离，球型半径，单位Lepton，一格是256", ROT));
        res.push(makeCompletionItem("ZOffset", "ZOffset=${1:104} ;检测的高度偏移，单位Lepton，一格高度是208，单位的0点在脚下，坐标加上偏移值，再检测，穿过建筑以Height加上偏移计算碰撞", "检测的高度偏移，单位Lepton，一格高度是208，单位的0点在脚下，坐标加上偏移值，再检测，穿过建筑以Height加上偏移计算碰撞", ROT));
        res.push(makeCompletionItem("AffectsOwner", "AffectsOwner=${1:no} ;碰触发射者同阵营单位时引爆", "碰触发射者同阵营单位时引爆", ROT));
        res.push(makeCompletionItem("AffectsAllies", "AffectsAllies=${1:no} ;碰触友军单位时引爆", "碰触友军单位时引爆", ROT));
        res.push(makeCompletionItem("AffectsEnemies", "AffectsEnemies=${1:yes} ;碰触敌方单位时引爆", "碰触敌方单位时引爆", ROT));
        //侵彻
        res.push(makeCompletionItem("Penetration", "Penetration=${1:no} ;启用碰撞引信时，碰触后是否穿透继续飞行", "启用碰撞引信时，碰触后是否穿透继续飞行", ROT));
        res.push(makeCompletionItem("PenetrationWarhead", "PenetrationWarhead=$0 ;启用侵彻时，对穿透的目标造成伤害的弹头，默认为自身弹头", "启用碰撞引信时，对穿透的目标造成伤害的弹头，默认为自身弹头", ROT));
        res.push(makeCompletionItem("PenetrationWeapon", "PenetrationWeapon=$0 ;启用侵彻时，对穿透的目标发射额外的武器", "启用碰撞引信时，对穿透的目标发射额外的武器", ROT));
        res.push(makeCompletionItem("PenetrationTimes", "PenetrationTimes=${1:-1} ;侵彻引爆多少次后销毁", "侵彻引爆多少次后销毁", ROT));
        res.push(makeCompletionItem("PenetrationBuildingOnce", "PenetrationBuildingOnce=${1:no} ;侵彻占地多格的建筑只引爆一次", "侵彻占地多格的建筑只引爆一次", ROT));
    }
    if (/^Proximity+\.PenetrationWarhead=/g.test(lineText)) {
        const v = makeCompletionItemFromSection("Warheads");
        res = res.concat(v);
    }
    if (/^Proximity+\.PenetrationWeapon=/g.test(lineText)) {
        const v = makeCompletionItemFromSection("WeaponTypes");
        res = res.concat(v);
    }

    const proximity = [
        "[WeaponType]",
        "ProximityRange=0  ;提前引爆距离，单位格",
        "ProximityRange.Random=0,1 ;随机提前引爆距离，[最小值,最大值]"
    ];
    // 提前引爆抛射体
    if (/^P[roximityRange]{0,13}$/g.test(lineText)) {
        res.push(makeCompletionItem("ProximityRange", "ProximityRange", "提前引爆抛射体", proximity));
        res.push(makeCompletionItem("ProximityRange=num", "ProximityRange=${1:0} ;距离目标多少格时提前引爆", "距离目标多少格时提前引爆", proximity));
        res.push(makeCompletionItem("ProximityRange.Random", "ProximityRange.Random=${1:0},${2:1} ;随机提前引爆距离，[最小值,最大值]", "随机提前引爆距离，[最小值,最大值]", proximity));
    }
    if (/^ProximityRange\=/g.test(lineText)) {
        res.push(makeCompletionItem("0", "${1:0} ;距离目标多少格时提前引爆", "距离目标多少格时提前引爆", proximity));
    }
    if (/^ProximityRange\./g.test(lineText)) {
        res.push(makeCompletionItem("Random", "Random=${1:0},${2:1} ;随机提前引爆距离，[最小值,最大值]", "随机提前引爆距离，[最小值,最大值]", proximity));
    }


    const attackBeacon = [
        "[TechnoType]",
        "AttackBeacon.Enable=yes",
        "AttackBeacon.Types=V3,DRED ;炒粉谁",
        "AttackBeacon.Num=-1,-1 ;每个类型最多炒几个",
        "AttackBeacon.Rate=30 ;多少帧炒粉一次",
        "AttackBeacon.Delay=0 ;初始启动延迟",
        "AttackBeacon.RangeMin=0 ;炒粉的最小范围",
        "AttackBeacon.RangeMax=-1 ;炒粉的最大范围",
        "AttackBeacon.Close=yes ;是否优先炒粉最近的目标",
        "AttackBeacon.Force=no ;不论目标单位在做什么，都强制转换目标为自己",
        "AttackBeacon.Count=1 ;不管是谁，每次炒粉的总数量上限，-1是无限制",
        "AttackBeacon.TargetToCell=no ;被炒粉的单位强制攻击炒粉者的脚下",
        "AttackBeacon.AffectsOwner=yes",
        "AttackBeacon.AffectsAllies=no",
        "AttackBeacon.AffectsEnemies=no",
        "AttackBeacon.AffectsCivilian=no"
    ];
    // 攻击信标
    if (/^A[ttackBeacon]{0,11}$/g.test(lineText)) {
        res.push(makeCompletionItem("AttackBeacon", "AttackBeacon", "攻击信标", attackBeacon));
        res.push(makeCompletionItem("AttackBeacon.Enable", "AttackBeacon.Enable=${1:yes} ;打我", "打我", attackBeacon));
        res.push(makeCompletionItem("AttackBeacon.Types", "AttackBeacon.Types=$0 ;谁打我，可以是多个", "谁打我，可以是多个", attackBeacon));
        res.push(makeCompletionItem("AttackBeacon.Num", "AttackBeacon.Num=${1:-1} ;每个类型最多几个", "每个类型最多几个", attackBeacon));
        res.push(makeCompletionItem("AttackBeacon.Rate", "AttackBeacon.Rate=${1:30} ;多少帧嘲讽一次", "多少帧嘲讽一次", attackBeacon));
        res.push(makeCompletionItem("AttackBeacon.Delay", "AttackBeacon.Delay=${1:0} ;初始启动延迟", "初始启动延迟", attackBeacon));
        res.push(makeCompletionItem("AttackBeacon.RangeMin", "AttackBeacon.RangeMin=${1:0} ;嘲讽的最小范围", "嘲讽的最小范围", attackBeacon));
        res.push(makeCompletionItem("AttackBeacon.RangeMax", "AttackBeacon.RangeMax=${1:-1} ;嘲讽的最大范围", "嘲讽的最大范围", attackBeacon));
        res.push(makeCompletionItem("AttackBeacon.Close", "AttackBeacon.Close=${1:yes} ;是否优先嘲讽最近的目标", "是否优先嘲讽最近的目标", attackBeacon));
        res.push(makeCompletionItem("AttackBeacon.Force", "AttackBeacon.Force=${1:no} ;不论目标单位在做什么，都强制转换目标为自己", "不论目标单位在做什么，都强制转换目标为自己", attackBeacon));
        res.push(makeCompletionItem("AttackBeacon.Count", "AttackBeacon.Count=${1:1} ;不管是谁，每次嘲讽的总数量上限，-1是无限制", "不管是谁，每次嘲讽的总数量上限，-1是无限制", attackBeacon));
        res.push(makeCompletionItem("AttackBeacon.TargetToCell", "AttackBeacon.TargetToCell=${1:no} ;被嘲讽的单位强制攻击我所在的位置而不是我", "被嘲讽的单位强制攻击我所在的位置而不是我", attackBeacon));
        res.push(makeCompletionItem("AttackBeacon.AffectsOwner", "AttackBeacon.AffectsOwner=${1:yes} ;吸引自身阵营的单位", "吸引自身阵营的单位", attackBeacon));
        res.push(makeCompletionItem("AttackBeacon.AffectsAllies", "AttackBeacon.AffectsAllies=${1:no} ;吸引友军单位", "吸引友军单位", attackBeacon));
        res.push(makeCompletionItem("AttackBeacon.AffectsEnemies", "AttackBeacon.AffectsEnemies=${1:no} ;吸引敌方单位", "吸引敌方单位", attackBeacon));
        res.push(makeCompletionItem("AttackBeacon.AffectsCivilian", "AttackBeacon.AffectsCivilian=${1:no} ;吸引中立方单位", "吸引中立方单位", attackBeacon));
    }
    if (/^AttackBeacon\.(.(?!\=))*$/g.test(lineText)) {
        res.push(makeCompletionItem("Enable", "Enable=${1:yes} ;打我", "打我", attackBeacon));
        res.push(makeCompletionItem("Types", "Types=$0 ;谁打我，可以是多个", "谁打我，可以是多个", attackBeacon));
        res.push(makeCompletionItem("Num", "Num=${1:-1} ;每个类型最多几个，与类型对应", "每个类型最多几个，与类型对应", attackBeacon));
        res.push(makeCompletionItem("Rate", "Rate=${1:30} ;多少帧嘲讽一次", "多少帧嘲讽一次", attackBeacon));
        res.push(makeCompletionItem("Delay", "Delay=${1:0} ;初始启动延迟", "初始启动延迟", attackBeacon));
        res.push(makeCompletionItem("RangeMin", "RangeMin=${1:0} ;嘲讽的最小范围", "嘲讽的最小范围", attackBeacon));
        res.push(makeCompletionItem("RangeMax", "RangeMax=${1:-1} ;嘲讽的最大范围", "嘲讽的最大范围", attackBeacon));
        res.push(makeCompletionItem("Close", "Close=${1:yes} ;是否优先嘲讽最近的目标", "是否优先嘲讽最近的目标", attackBeacon));
        res.push(makeCompletionItem("Force", "Force=${1:no} ;不论目标单位在做什么，都强制转换目标为自己", "不论目标单位在做什么，都强制转换目标为自己", attackBeacon));
        res.push(makeCompletionItem("Count", "Count=${1:1} ;不管是谁，每次嘲讽的总数量上限，-1是无限制", "不管是谁，每次嘲讽的总数量上限，-1是无限制", attackBeacon));
        res.push(makeCompletionItem("TargetToCell", "TargetToCell=${1:no} ;被嘲讽的单位强制攻击我所在的位置而不是我", "被嘲讽的单位强制攻击我所在的位置而不是我", attackBeacon));
        res.push(makeCompletionItem("AffectsOwner", "AffectsOwner=${1:yes} ;吸引自身阵营的单位", "吸引自身阵营的单位", attackBeacon));
        res.push(makeCompletionItem("AffectsAllies", "AffectsAllies=${1:no} ;吸引友军单位", "吸引友军单位", attackBeacon));
        res.push(makeCompletionItem("AffectsEnemies", "AffectsEnemies=${1:no} ;吸引敌方单位", "吸引敌方单位", attackBeacon));
        res.push(makeCompletionItem("AffectsCivilian", "AffectsCivilian=${1:no} ;吸引中立方单位", "吸引中立方单位", attackBeacon));
    }
    if (/^AttackBeacon\.Types=/g.test(lineText)) {
        const i = makeCompletionItemFromSection("InfantryTypes");
        res = res.concat(i);
        const v = makeCompletionItemFromSection("VehicleTypes");
        res = res.concat(v);
    }

    const destroyAnims = [
        "[TechnoType]",
        "DestroyAnims=Anim1,Anim2,Anim3,Anim4,Anim5,Anim6,Anim7,Anim8",
        "DestroyAnims.Random=no ;随机播放死亡动画，非8的倍数也随机"
    ];
    // 单位死亡动画，强制使用单位色盘，带所属色，8的倍数则带方向，屏幕正上方为0，顺时针，带炮塔的单位以炮塔朝向为主要朝向
    if (/^D[estroyAnims]{0,11}$/g.test(lineText)) {
        res.push(makeCompletionItem("DestroyAnims", "DestroyAnims", "死亡动画，如果个数是8的倍数则按照死亡朝向播放", destroyAnims));
        res.push(makeCompletionItem("DestroyAnims.Random", "DestroyAnims.Random=${1:no} ;随机播放死亡动画，非8的倍数也随机", "随机播放死亡动画，非8的倍数也随机", destroyAnims));
    }
    if (/^DestroyAnims\=/g.test(lineText)) {
        const v = makeCompletionItemFromSection("Animations");
        res = res.concat(v);
    }
    if (/^DestroyAnims\./g.test(lineText)) {
        res.push(makeCompletionItem("Random", "Random=${1:no} ;随机播放死亡动画，非8的倍数也随机", "随机播放死亡动画，非8的倍数也随机", destroyAnims));
    }

    const destroySelf = [
        "[TechnoType]",
        "[AttachEffectType]",
        "DestroySelf.Delay=0 ;延迟多长时间自毁，可以写yes=0，no=不起做用，自毁AE等同并覆盖单位身上的DestroySelf.Delay",
        "DestroySelf.Peaceful=yes ;平静的消失，不发生爆炸"
    ];
    // 自毁
    if (/^D[estroySelf]{0,10}$/g.test(lineText)) {
        res.push(makeCompletionItem("DestroySelf", "DestroySelf", "定时自毁", destroySelf));
        res.push(makeCompletionItem("DestroySelf.Delay", "DestroySelf.Delay=${1:0} ;延迟多长时间自毁，可以写yes=0，no=不起做用，自毁AE等同并覆盖单位身上的DestroySelf.Delay", "延迟多长时间自毁，可以写yes=0，no=不起做用，自毁AE等同并覆盖单位身上的DestroySelf.Delay", destroySelf));
        res.push(makeCompletionItem("DestroySelf.Peaceful", "DestroySelf.Peaceful=${1:yes} ;平静的消失，不发生爆炸", "平静的消失，不发生爆炸", destroySelf));
    }
    if (/^DestroySelf\./g.test(lineText)) {
        res.push(makeCompletionItem("Delay", "Delay=${1:0} ;延迟多长时间自毁，可以写yes=0，no=不起做用，自毁AE等同并覆盖单位身上的DestroySelf.Delay", "延迟多长时间自毁，可以写yes=0，no=不起做用，自毁AE等同并覆盖单位身上的DestroySelf.Delay", destroySelf));
        res.push(makeCompletionItem("Peaceful", "Peaceful=${1:yes} ;平静的消失，不发生爆炸", "平静的消失，不发生爆炸", destroySelf));
    }

    const giftBox = [
        "[TechnoType]",
        "GiftBox.Types=HTNK,E2 ;礼物",
        "GiftBox.Nums=1,1 ;数量",
        "GiftBox.Remove=yes ;开盒后删除盒子",
        "GiftBox.Explodes=no ;删除盒子后会不会引起爆炸，触发死亡武器",
        "GiftBox.Delay=0 ;多久后开盒",
        "GiftBox.RandomDelay=0,300 ;随机延迟",
        "GiftBox.RandomRange=0 ;礼物刷在附近随机范围内，单位格",
        "GiftBox.RandomToEmptyCell=no ;礼物只在空地上刷，没有空地就刷在原地",
        "GiftBox.RandomType=no ;随机从列表中选取类型，并创建等于nums的总数量",
        "GiftBox.OpenWhenDestoryed=no ;礼盒单位被摧毁时释放礼物，yes时仅在被摧毁时释放，延迟等设置无效"
    ];
    // 礼盒单位
    if (/^G[iftBox]{0,6}$/g.test(lineText)) {
        res.push(makeCompletionItem("GiftBox", "GiftBox", "礼物盒子", giftBox));
        res.push(makeCompletionItem("GiftBox.Types", "GiftBox.Types=$0 ;礼物类型，可以是多个", "礼物类型，可以是多个", giftBox));
        res.push(makeCompletionItem("GiftBox.Nums", "GiftBox.Nums=${1:1} ;数量，与类型对应", "数量，与类型对应", giftBox));
        res.push(makeCompletionItem("GiftBox.Remove", "GiftBox.Remove=${1:yes} ;开盒后删除盒子", "开盒后删除盒子", giftBox));
        res.push(makeCompletionItem("GiftBox.Explodes", "GiftBox.Explodes=${1:no} ;删除盒子后会不会引起爆炸，触发死亡武器", "删除盒子后会不会引起爆炸，触发死亡武器", giftBox));
        res.push(makeCompletionItem("GiftBox.Delay", "GiftBox.Delay=${1:0} ;多久后开盒", "多久后开盒", giftBox));
        res.push(makeCompletionItem("GiftBox.RandomDelay", "GiftBox.RandomDelay=${1:0,${2:300} ;随机延迟", "随机延迟", giftBox));
        res.push(makeCompletionItem("GiftBox.RandomRange", "GiftBox.RandomRange=${1:0} ;礼物刷在附近随机范围内，单位格", "礼物刷在附近随机范围内，单位格", giftBox));
        res.push(makeCompletionItem("GiftBox.RandomToEmptyCell", "GiftBox.RandomToEmptyCell=${1:no} ;礼物只在空地上刷，没有空地就刷在原地", "礼物只在空地上刷，没有空地就刷在原地", giftBox));
        res.push(makeCompletionItem("GiftBox.RandomType", "GiftBox.RandomType=${1:no} ;随机从列表中选取类型，并创建等于nums的总数量", "随机从列表中选取类型，并创建等于nums的总数量", giftBox));
        res.push(makeCompletionItem("GiftBox.OpenWhenDestoryed", "GiftBox.OpenWhenDestoryed=${1:no} ;礼盒单位被摧毁时释放礼物，yes时仅在被摧毁时释放，延迟等设置无效", "礼盒单位被摧毁时释放礼物，yes时仅在被摧毁时释放，延迟等设置无效", giftBox));
    }
    if (/^GiftBox\.(.(?!\=))*$/g.test(lineText)) {
        res.push(makeCompletionItem("Types", "Types=$0 ;礼物类型，可以是多个", "礼物类型，可以是多个", giftBox));
        res.push(makeCompletionItem("Nums", "Nums=${1:1} ;数量，与类型对应", "数量，与类型对应", giftBox));
        res.push(makeCompletionItem("Remove", "Remove=${1:yes} ;开盒后删除盒子", "开盒后删除盒子", giftBox));
        res.push(makeCompletionItem("Explodes", "Explodes=${1:no} ;删除盒子后会不会引起爆炸，触发死亡武器", "删除盒子后会不会引起爆炸，触发死亡武器", giftBox));
        res.push(makeCompletionItem("Delay", "Delay=${1:0} ;多久后开盒", "多久后开盒", giftBox));
        res.push(makeCompletionItem("RandomDelay", "RandomDelay=${1:0,${2:300} ;随机延迟", "随机延迟", giftBox));
        res.push(makeCompletionItem("RandomRange", "RandomRange=${1:0} ;礼物刷在附近随机范围内，单位格", "礼物刷在附近随机范围内，单位格", giftBox));
        res.push(makeCompletionItem("RandomToEmptyCell", "RandomToEmptyCell=${1:no} ;礼物只在空地上刷，没有空地就刷在原地", "礼物只在空地上刷，没有空地就刷在原地", giftBox));
        res.push(makeCompletionItem("RandomType", "RandomType=${1:no} ;随机从列表中选取类型，并创建等于nums的总数量", "随机从列表中选取类型，并创建等于nums的总数量", giftBox));
        res.push(makeCompletionItem("OpenWhenDestoryed", "OpenWhenDestoryed=${1:no} ;礼盒单位被摧毁时释放礼物，yes时仅在被摧毁时释放，延迟等设置无效", "礼盒单位被摧毁时释放礼物，yes时仅在被摧毁时释放，延迟等设置无效", giftBox));
    }
    if (/^GiftBox\.Types=/g.test(lineText)) {
        const i = makeCompletionItemFromSection("InfantryTypes");
        res = res.concat(i);
        const v = makeCompletionItemFromSection("VehicleTypes");
        res = res.concat(v);
    }

    const jj = [
        "[TechnoType]",
        "JumpJet=yes ;注意大小写，wwsb",
        "JumpjetFacingToTarget=yes",
        "JumpjetFacing=8 ;细分面数，8的倍数，建议不要改动"
    ];
    // Jumpjet载具攻击时面向目标
    if (/^J[umpjetFacing]{0,12}$/g.test(lineText)) {
        res.push(makeCompletionItem("JumpjetFacingToTarget", "JumpjetFacingToTarget=${1:yes} ;Jumpjet在攻击时强制朝向目标", "Jumpjet在攻击时强制朝向目标", jj));
        res.push(makeCompletionItem("JumpjetFacing", "JumpjetFacing=${1:8} ;Jumpjet面向目标的细分面数，8的倍数，建议不要改动", "Jumpjet面向目标的细分面数，8的倍数，建议不要改动", jj));
    }

    const crawlingFLH = [
        "[TechnoTypeArt]",
        "PrimaryCrawlingFLH=150,0,225",
        "ElitePrimaryCrawlingFLH=150,0,225",
        "SecondaryCrawlingFLH=150,0,225",
        "EliteSecondaryCrawlingFLH=150,0,225"
    ];
    // 步兵单位卧倒时的FLH设置
    if (/^(P|(E[liteP]{0,5}))[rimaryCrawlingFLH]{0,12}$/g.test(lineText)) {
        res.push(makeCompletionItem("PrimaryCrawlingFLH", "PrimaryCrawlingFLH=${1:150},${2:0},${3:225} ;步兵卧倒时的主武器开火坐标", "步兵卧倒时的主武器开火坐标", crawlingFLH));
        res.push(makeCompletionItem("ElitePrimaryCrawlingFLH", "ElitePrimaryCrawlingFLH=${1:150},${2:0},${3:225} ;精英步兵卧倒时的主武器开火坐标", "精英步兵卧倒时的主武器开火坐标", crawlingFLH));
    }
    if (/^(S|(E[liteS]{0,5}))[econdaryCrawlingFLH]{0,19}$/g.test(lineText)) {
        res.push(makeCompletionItem("SecondaryCrawlingFLH", "SecondaryCrawlingFLH=${1:150},${2:0},${3:225} ;步兵卧倒时的副武器开火坐标", "步兵卧倒时的副武器开火坐标", crawlingFLH));
        res.push(makeCompletionItem("EliteSecondaryCrawlingFLH", "EliteSecondaryCrawlingFLH=${1:150},${2:0},${3:225} ;精英步兵卧倒时的副武器开火坐标", "精英步兵卧倒时的副武器开火坐标", crawlingFLH));
    }

    const trail = [
        "[TrailTypes] ;新注册表",
        "+=NewTrail1",
        "+=NewTrail2",
        "",
        "[NewTrail1]",
        "Mode=LASER ;尾巴的类型，LASER\\BEAM\\ELECTRIC\\PARTICLE\\ANIM",
        "; 尾巴的通用设置",
        "Distance=64 ;距离多远画一段尾巴，256为1格，越短资源消耗越大，尾巴越平滑",
        "IgnoreVertical=no ;忽略垂直方向的移动，如战机升空",
        "InitialDelay=0 ;初始化延迟"
    ];
    // 尾巴
    // 尾巴通用设置
    if (/^M[ode]{0,3}$/g.test(lineText)) {
        res.push(makeCompletionItem("Mode", "Mode", "尾巴类型，LASER\\BEAM\\ELECTRIC\\PARTICLE\\ANIM", trail));
        res.push(makeCompletionItem("Mode=LASER", "Mode=LASER ;尾巴类型，LASER\\BEAM\\ELECTRIC\\PARTICLE\\ANIM", "激光尾巴", trail));
        res.push(makeCompletionItem("Mode=BEAM", "Mode=BEAM ;尾巴类型，LASER\\BEAM\\ELECTRIC\\PARTICLE\\ANIM", "辐射波尾巴", trail));
        res.push(makeCompletionItem("Mode=ELECTRIC", "Mode=ELECTRIC ;尾巴类型，LASER\\BEAM\\ELECTRIC\\PARTICLE\\ANIM", "电弧尾巴", trail));
        res.push(makeCompletionItem("Mode=PARTICLE", "Mode=PARTICLE ;尾巴类型，LASER\\BEAM\\ELECTRIC\\PARTICLE\\ANIM", "粒子尾巴", trail));
        res.push(makeCompletionItem("Mode=ANIM", "Mode=ANIM ;尾巴类型，LASER\\BEAM\\ELECTRIC\\PARTICLE\\ANIM", "动画尾巴", trail));
    }
    if (/^Mode\=/g.test(lineText)) {
        res.push(makeCompletionItem("LASER", "LASER ;尾巴类型，LASER\\BEAM\\ELECTRIC\\PARTICLE\\ANIM", "激光尾巴", trail));
        res.push(makeCompletionItem("BEAM", "BEAM ;尾巴类型，LASER\\BEAM\\ELECTRIC\\PARTICLE\\ANIM", "辐射波尾巴", trail));
        res.push(makeCompletionItem("ELECTRIC", "ELECTRIC ;尾巴类型，LASER\\BEAM\\ELECTRIC\\PARTICLE\\ANIM", "电弧尾巴", trail));
        res.push(makeCompletionItem("PARTICLE", "PARTICLE ;尾巴类型，LASER\\BEAM\\ELECTRIC\\PARTICLE\\ANIM", "粒子尾巴", trail));
        res.push(makeCompletionItem("ANIM", "ANIM ;尾巴类型，LASER\\BEAM\\ELECTRIC\\PARTICLE\\ANIM", "动画尾巴", trail));
    }
    if (/^D[istance]{0,7}$/g.test(lineText)) {
        //尾巴的通用设置
        res.push(makeCompletionItem("Distance", "Distance=${1:64} ;距离多远画一段尾巴，256为1格，越短资源消耗越大，尾巴越平滑", "距离多远画一段尾巴，256为1格，越短资源消耗越大，尾巴越平滑", trail));
    }
    if (/^I[gnoreVertical]{0,13}$/g.test(lineText)) {
        res.push(makeCompletionItem("IgnoreVertical", "IgnoreVertical=${1:no} ;忽略垂直方向的移动，如战机升空", "忽略垂直方向的移动，如战机升空", trail));
    }
    if (/^I[nitialDelay]{0,11}$/g.test(lineText)) {
        res.push(makeCompletionItem("InitialDelay", "InitialDelay=${1:0} ;初始延迟", "初始延迟", trail));
    }

    const laserTrail = [
        "[TrailType]",
        "Mode=LASER ;尾巴的类型，LASER\\BEAM\\ELECTRIC\\PARTICLE\\ANIM",
        "; 尾巴的通用设置",
        "Distance=64 ;距离多远画一段尾巴，256为1格，越短资源消耗越大，尾巴越平滑",
        "IgnoreVertical=no ;忽略垂直方向的移动，如战机升空",
        "InitialDelay=0 ;初始化延迟",
        "; 激光尾巴专用设置",
        "Laser.IsHouseColor=no ;启用阵营色，",
        "Laser.IsSupported=no ;更亮",
        "Laser.Fade=yes ;尾巴尖尖",
        "Laser.InnerColor=204,64,6 ;尾巴的颜色",
        "Laser.OuterColor=102,32,3 ;IsHouseColor=yes 或者 Fade=yes 时无效",
        "Laser.OuterSpread=0,0,0 ;同上",
        "Laser.Duration=15 ;尾巴的持续时间，持续时间越长尾巴越长",
        "Laser.Thickness=2 ;尾巴的宽度"
    ];
    // 激光尾巴专用设置
    if (/^L[aser]{0,4}$/g.test(lineText)) {
        res.push(makeCompletionItem("Laser", "Laser", "激光尾巴", laserTrail));
        res.push(makeCompletionItem("Laser.IsHouseColor", "Laser.IsHouseColor=${1:no} ;启用阵营色", "启用阵营色", laserTrail));
        res.push(makeCompletionItem("Laser.IsSupported", "Laser.IsSupported=${1:no} ;更亮", "更亮", laserTrail));
        res.push(makeCompletionItem("Laser.Fade", "Laser.Fade=${1:yes} ;尾巴尖尖", "尾巴尖尖", laserTrail));
        res.push(makeCompletionItem("Laser.InnerColor", "Laser.InnerColor=${1:204},${2:64},${3:6} ;尾巴的颜色", "尾巴的颜色", laserTrail));
        res.push(makeCompletionItem("Laser.OuterColor", "Laser.OuterColor=${1:102},${2:32},${3:3} ;IsHouseColor=yes 或者 Fade=yes 时无效", "IsHouseColor=yes 或者 Fade=yes 时无效", laserTrail));
        res.push(makeCompletionItem("Laser.OuterSpread", "Laser.OuterSpread=${1:0},${2:0},${3:0} ;IsHouseColor=yes 或者 Fade=yes 时无效", "IsHouseColor=yes 或者 Fade=yes 时无效", laserTrail));
        res.push(makeCompletionItem("Laser.Duration", "Laser.Duration=${1:15} ;持续时间", "持续时间", laserTrail));
        res.push(makeCompletionItem("Laser.Thickness", "Laser.Thickness=${1:2} ;宽度", "宽度", laserTrail));
    }
    if (/^Laser\./g.test(lineText)) {
        res.push(makeCompletionItem("IsHouseColor", "IsHouseColor=${1:no} ;启用阵营色", "启用阵营色", laserTrail));
        res.push(makeCompletionItem("IsSupported", "IsSupported=${1:no} ;更亮", "更亮", laserTrail));
        res.push(makeCompletionItem("Fade", "Fade=${1:yes} ;尾巴尖尖", "尾巴尖尖", laserTrail));
        res.push(makeCompletionItem("InnerColor", "InnerColor=${1:204},${2:64},${3:6} ;尾巴的颜色", "尾巴的颜色", laserTrail));
        res.push(makeCompletionItem("OuterColor", "OuterColor=${1:102},${2:32},${3:3} ;IsHouseColor=yes 或者 Fade=yes 时无效", "IsHouseColor=yes 或者 Fade=yes 时无效", laserTrail));
        res.push(makeCompletionItem("OuterSpread", "OuterSpread=${1:0},${2:0},${3:0} ;IsHouseColor=yes 或者 Fade=yes 时无效", "IsHouseColor=yes 或者 Fade=yes 时无效", laserTrail));
        res.push(makeCompletionItem("Duration", "Duration=${1:15} ;持续时间", "持续时间", laserTrail));
        res.push(makeCompletionItem("Thickness", "Thickness=${1:2} ;宽度", "宽度", laserTrail));
    }

    const beamTrail = [
        "[TrailType]",
        "Mode=BEAM ;尾巴的类型，LASER\\BEAM\\ELECTRIC\\PARTICLE\\ANIM",
        "; 尾巴的通用设置",
        "Distance=64 ;距离多远画一段尾巴，256为1格，越短资源消耗越大，尾巴越平滑",
        "IgnoreVertical=no ;忽略垂直方向的移动，如战机升空",
        "InitialDelay=0 ;初始化延迟",
        "; 辐射波专用设置",
        "Beam.Color=0,255,0 ;波的自定义颜色",
        "Beam.Period=15 ;波的周期",
        "Beam.Amplitude=40.0 ;波的振幅"
    ]
    // 辐射波尾巴专用设置
    if (/^B[eam]{0,3}$/g.test(lineText)) {
        res.push(makeCompletionItem("Beam", "Beam", "辐射波尾巴", beamTrail));
        res.push(makeCompletionItem("Beam.Color", "Beam.Color=${1:0},${2:255},${3:0} ;波的颜色", "波的颜色", beamTrail));
        res.push(makeCompletionItem("Beam.Period", "Beam.Period=${1:15} ;波的周期", "波的周期", beamTrail));
        res.push(makeCompletionItem("Beam.Amplitude", "Beam.Amplitude=${1:40.0} ;波的振幅", "波的振幅", beamTrail));
    }
    if (/^Beam\./g.test(lineText)) {
        res.push(makeCompletionItem("Color", "Color=${1:0},${2:255},${3:0} ;波的颜色", "波的颜色", beamTrail));
        res.push(makeCompletionItem("Period", "Period=${1:15} ;波的周期", "波的周期", beamTrail));
        res.push(makeCompletionItem("Amplitude", "Amplitude=${1:40.0} ;波的振幅", "波的振幅", beamTrail));
    }

    const boltTrail = [
        "[TrailType]",
        "Mode=ELECTRIC ;尾巴的类型，LASER\\BEAM\\ELECTRIC\\PARTICLE\\ANIM",
        "; 尾巴的通用设置",
        "Distance=64 ;距离多远画一段尾巴，256为1格，越短资源消耗越大，尾巴越平滑",
        "IgnoreVertical=no ;忽略垂直方向的移动，如战机升空",
        "InitialDelay=0 ;初始化延迟",
        "; 电弧尾巴专用设置",
        "Bolt.IsAlternateColor=no ;启用充能颜色",
        "Bolt.Color1=0,0,255 ;自定义颜色",
        "Bolt.Color2=255,255,255",
        "Bolt.Color3=0,0,255",
        "Bolt.Disable1=no ;不显示这条电弧",
        "Bolt.Disable2=no",
        "Bolt.Disable3=no"
    ];
    // 电弧尾巴专用设置
    if (/^B[olt]{0,3}$/g.test(lineText)) {
        res.push(makeCompletionItem("Bolt", "Bolt", "电弧尾巴", boltTrail));
        res.push(makeCompletionItem("Bolt.IsAlternateColor", "Bolt.IsAlternateColor=${1:no} ;启用充能颜色", "启用充能颜色", boltTrail));
        res.push(makeCompletionItem("Bolt.Color1", "Bolt.Color1=${1:0},${2:0},${3:255} ;自定义颜色", "自定义颜色", boltTrail));
        res.push(makeCompletionItem("Bolt.Color2", "Bolt.Color2=${1:255},${2:255},${3:255} ;自定义颜色", "自定义颜色", boltTrail));
        res.push(makeCompletionItem("Bolt.Color3", "Bolt.Color3=${1:0},${2:0},${3:255} ;自定义颜色", "自定义颜色", boltTrail));
        res.push(makeCompletionItem("Bolt.Disable1", "Bolt.Disable1=${1:no} ;不显示这条电弧", "不显示这条电弧", boltTrail));
        res.push(makeCompletionItem("Bolt.Disable2", "Bolt.Disable2=${1:no} ;不显示这条电弧", "不显示这条电弧", boltTrail));
        res.push(makeCompletionItem("Bolt.Disable3", "Bolt.Disable3=${1:no} ;不显示这条电弧", "不显示这条电弧", boltTrail));
    }
    if (/^Bolt\./g.test(lineText)) {
        res.push(makeCompletionItem("IsAlternateColor", "IsAlternateColor=${1:no} ;启用充能颜色", "启用充能颜色", boltTrail));
        res.push(makeCompletionItem("Color1", "Color1=${1:0},${2:0},${3:255} ;自定义颜色", "自定义颜色", boltTrail));
        res.push(makeCompletionItem("Color2", "Color2=${1:255},${2:255},${3:255} ;自定义颜色", "自定义颜色", boltTrail));
        res.push(makeCompletionItem("Color3", "Color3=${1:0},${2:0},${3:255} ;自定义颜色", "自定义颜色", boltTrail));
        res.push(makeCompletionItem("Disable1", "Disable1=${1:no} ;不显示这条电弧", "不显示这条电弧", boltTrail));
        res.push(makeCompletionItem("Disable2", "Disable2=${1:no} ;不显示这条电弧", "不显示这条电弧", boltTrail));
        res.push(makeCompletionItem("Disable3", "Disable3=${1:no} ;不显示这条电弧", "不显示这条电弧", boltTrail));
    }

    const particleTrail = [
        "[TrailType]",
        "Mode=PARTICLE ;尾巴的类型，LASER\\BEAM\\ELECTRIC\\PARTICLE\\ANIM",
        "; 尾巴的通用设置",
        "Distance=64 ;距离多远画一段尾巴，256为1格，越短资源消耗越大，尾巴越平滑",
        "IgnoreVertical=no ;忽略垂直方向的移动，如战机升空",
        "InitialDelay=0 ;初始化延迟",
        "; 粒子系统尾巴专用该设置",
        "ParticleSystem=none ;粒子系统名称",
    ];
    // 粒子尾巴专用设置
    if (/^P[articleSystem]{0,13}$/g.test(lineText)) {
        res.push(makeCompletionItem("ParticleSystem", "ParticleSystem", "粒子系统名称", particleTrail));
    }
    if (/^ParticleSystem\=/g.test(lineText)) {
        const v = makeCompletionItemFromSection("ParticleSystems");
        res = res.concat(v);
    }

    const animTrail = [
        "[TrailType]",
        "Mode=ANIM ;尾巴的类型，LASER\\BEAM\\ELECTRIC\\PARTICLE\\ANIM",
        "; 尾巴的通用设置",
        "Distance=64 ;距离多远画一段尾巴，256为1格，越短资源消耗越大，尾巴越平滑",
        "IgnoreVertical=no ;忽略垂直方向的移动，如战机升空",
        "InitialDelay=0 ;初始化延迟",
        "; 动画尾巴专用设置",
        "Anim.While=none ;尾巴动画",
        "Anim.Start=none ;单位开始运动时播放",
        "Anim.Stop=none ;单位停下来时强制播放"
    ];
    // 动画尾巴专用设置
    if (/^A[nim]{0,3}$/g.test(lineText)) {
        res.push(makeCompletionItem("Anim", "Anim", null));
        res.push(makeCompletionItem("Anim.While", "Anim.While", "运动动画", animTrail));
        res.push(makeCompletionItem("Anim.Start", "Anim.Start", "单位开始运动时播放", animTrail));
        res.push(makeCompletionItem("Anim.Stop", "Anim.Stop", "单位停下来时强制播放", animTrail));
    }
    if (/^Anim\.(.(?!\=))*$/g.test(lineText)) {
        res.push(makeCompletionItem("While", "While", "运动动画", animTrail));
        res.push(makeCompletionItem("Start", "Start", "单位开始运动时播放", animTrail));
        res.push(makeCompletionItem("Stop", "Stop", "单位停下来时强制播放", animTrail));
    }
    if (/^Anim\..+\=/g.test(lineText)) {
        const v = makeCompletionItemFromSection("Animations");
        res = res.concat(v);
    }

    const useTrail = [
        "[ProjectileTypeArt] ;抛射体Image",
        "[TechnoTypeArt] ;单位的Image",
        "TrailX.Type=NewTrail1 ;尾巴的类型",
        "TrailX.FLH=0,0,0 ;尾巴的位置",
        "TrailX.IsOnTurret=no ;跟随炮塔旋转",
        "TrailX.OnLands=none ;只允许在这种地形上绘制 只允许在这种地形上绘制 Clear\\Road\\Water\\Rock\\Wall\\Tiberium\\Beach\\Rough\\Ice\\Railroad\\Tunnel\\Weeds",
        "TrailX.OnTiles=none ;只允许在这种地块上绘制 Tunnel\\Water\\Blank\\Ramp\\Cliff\\Shore\\Wet\\MiscPave\\Pave\\DirtRoad\\PavedRoad\\PavedRoadEnd\\PavedRoadSlope\\Median\\Bridge\\WoodBridge\\ClearToSandLAT\\Green\\NotWater\\DestroyableCliff",
    ];
    // 尾巴的使用
    if (/^T[rail]{0,4}$/g.test(lineText)) {
        res.push(makeCompletionItem("TrailX", "Trail${1:0}", "尾巴", useTrail));
        res.push(makeCompletionItem("TrailX.Type", "Trail${1:0}.Type", "尾巴的类型", useTrail));
        res.push(makeCompletionItem("TrailX.FLH", "Trail${1:0}.FLH=${1:0},${2:0},${3:0} ;尾巴的位置", "尾巴的位置", useTrail));
        res.push(makeCompletionItem("TrailX.IsOnTurret", "Trail${1:0}.IsOnTurret=${2:no} ;跟随炮塔旋转", "跟随炮塔旋转", useTrail));
        res.push(makeCompletionItem("TrailX.OnLands", "Trail${1:0}.OnLands=${2:none} ;只允许在这种地形上绘制 Clear\\Road\\Water\\Rock\\Wall\\Tiberium\\Beach\\Rough\\Ice\\Railroad\\Tunnel\\Weeds", "只允许在这种地形上绘制 Clear\\Road\\Water\\Rock\\Wall\\Tiberium\\Beach\\Rough\\Ice\\Railroad\\Tunnel\\Weeds", useTrail));
        res.push(makeCompletionItem("TrailX.OnTiles", "Trail${1:0}.OnTiles=${2:none} ;只允许在这种地块上绘制 Tunnel\\Water\\Blank\\Ramp\\Cliff\\Shore\\Wet\\MiscPave\\Pave\\DirtRoad\\PavedRoad\\PavedRoadEnd\\PavedRoadSlope\\Median\\Bridge\\WoodBridge\\ClearToSandLAT\\Green\\NotWater\\DestroyableCliff", "只允许在这种地块上绘制 Tunnel\\Water\\Blank\\Ramp\\Cliff\\Shore\\Wet\\MiscPave\\Pave\\DirtRoad\\PavedRoad\\PavedRoadEnd\\PavedRoadSlope\\Median\\Bridge\\WoodBridge\\ClearToSandLAT\\Green\\NotWater\\DestroyableCliff", useTrail));
    }
    if (/^Trail\d+\.(.(?!\=))*$/g.test(lineText)) {
        res.push(makeCompletionItem("Type", "Type", "尾巴的类型", useTrail));
        res.push(makeCompletionItem("FLH", "FLH=${1:0},${2:0},${3:0} ;尾巴的位置", "尾巴的位置", useTrail));
        res.push(makeCompletionItem("IsOnTurret", "IsOnTurret=${2:no} ;跟随炮塔旋转", "跟随炮塔旋转", useTrail));
        res.push(makeCompletionItem("OnLands", "OnLands", "只允许在这种地形上绘制 Clear\\Road\\Water\\Rock\\Wall\\Tiberium\\Beach\\Rough\\Ice\\Railroad\\Tunnel\\Weeds", useTrail));
        res.push(makeCompletionItem("OnTiles", "OnTiles", "只允许在这种地块上绘制 Tunnel\\Water\\Blank\\Ramp\\Cliff\\Shore\\Wet\\MiscPave\\Pave\\DirtRoad\\PavedRoad\\PavedRoadEnd\\PavedRoadSlope\\Median\\Bridge\\WoodBridge\\ClearToSandLAT\\Green\\NotWater\\DestroyableCliff", useTrail));
    }
    if (/^Trail\d+\.Type=/g.test(lineText)) {
        const v = makeCompletionItemFromSection("TrailTypes");
        res = res.concat(v);
    }
    if (/^Trail\d+\.OnLands=/g.test(lineText)) {
        res.push(makeCompletionItem("Clear", "Clear", null));
        res.push(makeCompletionItem("Road", "Road", null));
        res.push(makeCompletionItem("Water", "Water", null));
        res.push(makeCompletionItem("Rock", "Rock", null));
        res.push(makeCompletionItem("Wall", "Wall", null));
        res.push(makeCompletionItem("Tiberium", "Tiberium", null));
        res.push(makeCompletionItem("Beach", "Beach", null));
        res.push(makeCompletionItem("Rough", "Rough", null));
        res.push(makeCompletionItem("Ice", "Ice", null));
        res.push(makeCompletionItem("Railroad", "Railroad", null));
        res.push(makeCompletionItem("Tunnel", "Tunnel", null));
        res.push(makeCompletionItem("Weeds", "Weeds", null));
    }
    if (/^Trail\d+\.OnTiles=/g.test(lineText)) {
        res.push(makeCompletionItem("Tunnel", "Tunnel", null));
        res.push(makeCompletionItem("Water", "Water", null));
        res.push(makeCompletionItem("Blank", "Blank", null));
        res.push(makeCompletionItem("Ramp", "Ramp", null));
        res.push(makeCompletionItem("Cliff", "Cliff", null));
        res.push(makeCompletionItem("Shore", "Shore", null));
        res.push(makeCompletionItem("Wet", "Wet", null));
        res.push(makeCompletionItem("MiscPave", "MiscPave", null));
        res.push(makeCompletionItem("Pave", "Pave", null));
        res.push(makeCompletionItem("DirtRoad", "DirtRoad", null));
        res.push(makeCompletionItem("PavedRoad", "PavedRoad", null));
        res.push(makeCompletionItem("PavedRoadEnd", "PavedRoadEnd", null));
        res.push(makeCompletionItem("PavedRoadSlope", "PavedRoadSlope", null));
        res.push(makeCompletionItem("Median", "Median", null));
        res.push(makeCompletionItem("Bridge", "Bridge", null));
        res.push(makeCompletionItem("WoodBridge", "WoodBridge", null));
        res.push(makeCompletionItem("ClearToSandLAT", "ClearToSandLAT", null));
        res.push(makeCompletionItem("Green", "Green", null));
        res.push(makeCompletionItem("NotWater", "NotWater", null));
        res.push(makeCompletionItem("DestroyableCliff", "DestroyableCliff", null));
    }

    const passengers = [
        "[TechnoType]",
        "OpenTopped=yes",
        "Passengers.PassiveAcquire=yes ;乘客是否主动索敌，No表示乖巧。",
        "Passengers.ForceFire=yes ;强制乘客与载具攻击同一个目标",
        "Passengers.MobileFire=yes ;载具移动时乘客能开火",
        "Passengers.SameFire=yes ;载具攻击时乘客能开火"
    ];
    // 乘客
    if (/^P[assengers]{0,9}$/g.test(lineText)) {
        res.push(makeCompletionItem("Passengers", "Passengers", "乘客", passengers));
        res.push(makeCompletionItem("Passengers.PassiveAcquire", "Passengers.PassiveAcquire=${1:yes} ;乘客是否主动索敌，No表示乖巧。", "乘客是否主动索敌，No表示乖巧。", passengers));
        res.push(makeCompletionItem("Passengers.ForceFire", "Passengers.ForceFire=${1:yes} ;强制乘客与载具攻击同一个目标", "强制乘客与载具攻击同一个目标", passengers));
        res.push(makeCompletionItem("Passengers.MobileFire", "Passengers.MobileFire=${1:yes} ;载具移动时乘客能开火", "载具移动时乘客能开火", passengers));
        res.push(makeCompletionItem("Passengers.SameFire", "Passengers.SameFire=${1:yes} ;载具攻击时乘客能开火", "载具攻击时乘客能开火", passengers));
    }
    if (/^Passengers\./g.test(lineText)) {
        res.push(makeCompletionItem("PassiveAcquire", "PassiveAcquire=${1:yes} ;乘客是否主动索敌，No表示乖巧。", "乘客是否主动索敌，No表示乖巧。", passengers));
        res.push(makeCompletionItem("ForceFire", "ForceFire=${1:yes} ;强制乘客与载具攻击同一个目标", "强制乘客与载具攻击同一个目标", passengers));
        res.push(makeCompletionItem("MobileFire", "MobileFire=${1:yes} ;载具移动时乘客能开火", "载具移动时乘客能开火", passengers));
        res.push(makeCompletionItem("SameFire", "SameFire=${1:yes} ;载具攻击时乘客能开火", "载具攻击时乘客能开火", passengers));
    }

    const supportSpawns = [
        "[TechnoType]",
        "SupportSpawns=yes ;写在母舰上",
        "SupportSpawns.Weapon=BotLaserSupport ;武器",
        "SupportSpawns.EliteWeapon=BotLaserSupport ;精英武器",
        "SupportSpawns.SwitchFLH=yes ;启用FLH切换，第一次开火左边，第二次右边",
        "SupportSpawns.AlwaysFire=no ;一直发射支援武器指向子机"
    ];
    // 支援子机武器
    if (/^S[upportSpawns]{0,12}$/g.test(lineText)) {
        res.push(makeCompletionItem("SupportSpawns", "SupportSpawns", "子机开火时，母舰发射援助武器朝向子机", supportSpawns));
        res.push(makeCompletionItem("SupportSpawns=yes", "SupportSpawns=yes ;子机开火时，母舰发射援助武器朝向子机，写在母舰上", "子机开火时，母舰发射援助武器朝向子机，写在母舰上", supportSpawns));
        res.push(makeCompletionItem("SupportSpawns.Weapon", "SupportSpawns.Weapon=$0 ;母舰发射的援助武器", "母舰发射的援助武器", supportSpawns));
        res.push(makeCompletionItem("SupportSpawns.EliteWeapon", "SupportSpawns.EliteWeapon=$0 ;母舰发射的援助武器", "母舰发射的援助武器", supportSpawns));
        res.push(makeCompletionItem("SupportSpawns.SwitchFLH", "SupportSpawns.SwitchFLH=${1:yes} ;启用FLH切换，第一次开火左边，第二次右边", "启用FLH切换，第一次开火左边，第二次右边", supportSpawns));
        res.push(makeCompletionItem("SupportSpawns.AlwaysFire", "SupportSpawns.AlwaysFire=${1:no} ;一直发射支援武器指向子机", "一直发射支援武器指向子机", supportSpawns));
    }
    if (/^SupportSpawns\=/g.test(lineText)) {
        res.push(makeCompletionItem("yes", "yes ;子机开火时，母舰发射援助武器朝向子机，写在母舰上", "子机开火时，母舰发射援助武器朝向子机，写在母舰上", supportSpawns));
    }
    if (/^SupportSpawns\.(.(?!\=))*$/g.test(lineText)) {
        res.push(makeCompletionItem("Weapon", "Weapon=$0 ;母舰发射的援助武器", "母舰发射的援助武器", supportSpawns));
        res.push(makeCompletionItem("EliteWeapon", "EliteWeapon=$0 ;母舰发射的援助武器", "母舰发射的援助武器", supportSpawns));
        res.push(makeCompletionItem("SwitchFLH", "SwitchFLH=${1:yes} ;启用FLH切换，第一次开火左边，第二次右边", "启用FLH切换，第一次开火左边，第二次右边", supportSpawns));
        res.push(makeCompletionItem("AlwaysFire", "AlwaysFire=${1:no} ;一直发射支援武器指向子机", "一直发射支援武器指向子机", supportSpawns));
    }
    if (/^SupportSpawns+\.(Weapon|EliteWeapon)=/g.test(lineText)) {
        const v = makeCompletionItemFromSection("WeaponTypes");
        res = res.concat(v);
    }
    const supportSpawnsFLH = [
        "[TechnoTypeArt]",
        "SupportWeaponFLH=0,0,0 ;母舰“发射”武器的位置",
        "EliteSupportWeaponFLH=0,0,0",
        "SupportWeaponHitFLH=0,0,0 ;子机“接受”武器效果的位置",
        "EliteSupportWeaponHitFLH=0,0,0"
    ];
    // 支援子机武器的FLH设置
    if (/^(S|(E[liteS]{0,5}))[upportWeaponHitFLH]{0,18}$/g.test(lineText)) {
        res.push(makeCompletionItem("SupportWeaponFLH", "SupportWeaponFLH=${1:0},${2:0},${3:0} ;母舰“发射”武器的位置", "母舰“发射”武器的位置", supportSpawnsFLH));
        res.push(makeCompletionItem("EliteSupportWeaponFLH", "EliteSupportWeaponFLH=${1:0},${2:0},${3:0} ;母舰“发射”武器的位置", "母舰“发射”武器的位置", supportSpawnsFLH));
        res.push(makeCompletionItem("SupportWeaponHitFLH", "SupportWeaponHitFLH=${1:0},${2:0},${3:0} ;子机“接受”武器效果的位置", "子机“接受”武器效果的位置", supportSpawnsFLH));
        res.push(makeCompletionItem("EliteSupportWeaponHitFLH", "EliteSupportWeaponHitFLH=${1:0},${2:0},${3:0} ;子机“接受”武器效果的位置", "子机“接受”武器效果的位置", supportSpawnsFLH));
    }


    const spawnFireOnce = [
        "[TechnoType]",
        "SpawnFireOnce=yes ;取消子机管理器的目标",
        "SpawnFireOnceDelay=0 ;子机管理器获得目标后间隔多少帧后再取消目标"
    ];
    // 只发射一次的子机，通常用于子机导弹
    if (/^S[pawnFireOnce]{0,12}$/g.test(lineText)) {
        res.push(makeCompletionItem("SpawnFireOnce", "SpawnFireOnce=${1:yes} ;发射后取消子机管理器的目标", "发射后取消子机管理器的目标", spawnFireOnce));
        res.push(makeCompletionItem("SpawnFireOnceDelay", "SpawnFireOnceDelay=${1:0} ;子机管理器获得目标后间隔多少帧后再取消目标", "子机管理器获得目标后间隔多少帧后再取消目标", spawnFireOnce));
    }


    const berserkAnim = [
        "[AudioVisual]",
        "BerserkAnim=CHAOSANIM"
    ];
    // 单位混乱时，头上会显示的动画，LoopCount=-1，现在无炮塔的SHP载具会正确染红，有炮塔的没试过
    if (/^B[erserkAnim]{0,10}$/g.test(lineText)) {
        res.push(makeCompletionItem("BerserkAnim", "BerserkAnim=$0 ;单位混乱时，头上会显示的动画，LoopCount=-1", "单位混乱时，头上会显示的动画，LoopCount=-1", berserkAnim));
    }
    if (/^BerserkAnim\=/g.test(lineText)) {
        const v = makeCompletionItemFromSection("Animations");
        res = res.concat(v);
    }

    const putOffset = [
        "[General]",
        "AircraftNoHelipadPutOffset=0,0,12 ;单位格，飞机需要注册到PadAircraft",
        "AircraftForcePutOffset=no ;强制偏移",
        "AircraftRemoveIfNoDocks=no ;停机坪不足够时强制移除生产的飞机（主要影响AI）",
        "",
        "[AircraftType] ;覆盖全局设置",
        "NoHelipadPutOffset=0,0,12",
        "ForcePutOffset=no",
        "RemoveIfNoDocks=no"
    ];
    // 使用没有停机坪的机场生产出来的飞机，出生位置强制偏移，对子机无效
    if (/(^A[ircraft]{0,7}(.(?![\=\.]))*$)|(^N[oHelipadPutOffset]{0,17}(.(?![\=\.]))*$)|(^F[orcePutOffset]{0,13}(.(?![\=\.]))*$)|(^R[emoveIfNoDocks]{0,14}(.(?![\=\.]))*$)/g.test(lineText)) {
        res.push(makeCompletionItem("AircraftNoHelipadPutOffset", "AircraftNoHelipadPutOffset=${1:0},${2:0},${3:12} ;PadAircraft的飞机在生产时强制移位到这个位置，单位格", "PadAircraft的飞机在生产时强制移位到这个位置，单位格", putOffset));
        res.push(makeCompletionItem("AircraftForcePutOffset", "AircraftForcePutOffset=${1:no} ;PadAircraft的飞机在生产时强制移位", "PadAircraft的飞机在生产时强制移位", putOffset));
        res.push(makeCompletionItem("AircraftRemoveIfNoDocks", "AircraftRemoveIfNoDocks=${1:no} ;停机坪不足够时强制移除生产的飞机（主要影响AI）", "停机坪不足够时强制移除生产的飞机（主要影响AI）", putOffset));
        //undefined
        res.push(makeCompletionItem("NoHelipadPutOffset", "NoHelipadPutOffset=${1:0},${2:0},${3:12} ;PadAircraft的飞机在生产时强制移位到这个位置，单位格", "PadAircraft的飞机在生产时强制移位到这个位置，单位格", putOffset));
        res.push(makeCompletionItem("ForcePutOffset", "ForcePutOffset=${1:no} ;PadAircraft的飞机在生产时强制移位", "PadAircraft的飞机在生产时强制移位", putOffset));
        res.push(makeCompletionItem("RemoveIfNoDocks", "RemoveIfNoDocks=${1:no} ;停机坪不足够时强制移除生产的飞机（主要影响AI）", "停机坪不足够时强制移除生产的飞机（主要影响AI）", putOffset));
    }


    const attachFire = [
        "[WeaponType]",
        "AttachFire.UseROF=yes ;启用则每个附加武器独立计算ROF",
        "AttachFire.CheckRange=no ;启用每个附加武器检查射程",
        "AttachFire.RadialFire=no ;按照Burst伞形发射，仅影响ROT类型",
        "AttachFire.RadialAngle=180 ;按照Burst伞形发射，分割的角度",
        "AttachFire.SimulateBurst=no ;模拟原版的Burst有延迟的发射每一个武器",
        "AttachFire.SimulateBurstDelay=7 ;模拟原版的Burst时每次发射的间隔",
        "AttachFire.SimulateBurstMode=0 ;模拟原版的Burst模式，当FLH的L不为0时，0=不切换左右，1=LRLRLRLR，2=LLLLRRRR，3=LR*Burst",
        "AttachFire.OnlyFireInTransport=no ;只有在载具内才能使用这个附加武器",
        "AttachFire.UseAlternateFLH=no ;在载具内时，不使用AttachFire指定的FLH而是启用载具对应的FLH"
    ];
    // 附加武器详细设置，在附加武器、AE自动开火等功能在发射自定义武器时生效
    if (/^A[ttachFire]{0,9}$/g.test(lineText)) {
        res.push(makeCompletionItem("AttachFire", "AttachFire", "作为附加武器时的发射设置", attachFire));
        res.push(makeCompletionItem("AttachFire.UseROF", "AttachFire.UseROF=${1:yes} ;启用则每个附加武器独立计算ROF", "启用则每个附加武器独立计算ROF", attachFire));
        res.push(makeCompletionItem("AttachFire.CheckRange", "AttachFire.CheckRange=${1:no} ;启用每个附加武器检查射程", "启用每个附加武器检查射程", attachFire));
        res.push(makeCompletionItem("AttachFire.RadialFire", "AttachFire.RadialFire=${1:no} ;按照Burst伞形发射，仅影响ROT类型", "按照Burst伞形发射，仅影响ROT类型", attachFire));
        res.push(makeCompletionItem("AttachFire.RadialAngle", "AttachFire.RadialAngle=${1:180} ;按照Burst伞形发射，分割的角度", "按照Burst伞形发射，分割的角度", attachFire));
        res.push(makeCompletionItem("AttachFire.SimulateBurst", "AttachFire.SimulateBurst=${1:no} ;模拟原版的Burst有延迟的发射每一个武器", "模拟原版的Burst有延迟的发射每一个武器", attachFire));
        res.push(makeCompletionItem("AttachFire.SimulateBurstDelay", "AttachFire.SimulateBurstDelay=${1:7} ;模拟原版的Burst时每次发射的间隔", "模拟原版的Burst时每次发射的间隔", attachFire));
        res.push(makeCompletionItem("AttachFire.SimulateBurstMode", "AttachFire.SimulateBurstMode=${1:0} ;模拟原版的Burst模式，当FLH的L不为0时，0=不切换左右，1=LRLRLRLR，2=LLLLRRRR，3=LR*Burst", "模拟原版的Burst模式，当FLH的L不为0时，0=不切换左右，1=LRLRLRLR，2=LLLLRRRR，3=LR*Burst", attachFire));
        res.push(makeCompletionItem("AttachFire.OnlyFireInTransport", "AttachFire.OnlyFireInTransport=${1:no} ;只有在载具内才能使用这个附加武器", "只有在载具内才能使用这个附加武器", attachFire));
        res.push(makeCompletionItem("AttachFire.UseAlternateFLH", "AttachFire.UseAlternateFLH=${1:no} ;在载具内时，不使用AttachFire指定的FLH而是启用载具对应的FLH", "在载具内时，不使用AttachFire指定的FLH而是启用载具对应的FLH", attachFire));
    }
    if (/^AttachFire\./g.test(lineText)) {
        res.push(makeCompletionItem("UseROF", "UseROF=${1:yes} ;启用则每个附加武器独立计算ROF", "启用则每个附加武器独立计算ROF", attachFire));
        res.push(makeCompletionItem("CheckRange", "CheckRange=${1:no} ;启用每个附加武器检查射程", "启用每个附加武器检查射程", attachFire));
        res.push(makeCompletionItem("RadialFire", "RadialFire=${1:no} ;按照Burst伞形发射，仅影响ROT类型", "按照Burst伞形发射，仅影响ROT类型", attachFire));
        res.push(makeCompletionItem("RadialAngle", "RadialAngle=${1:180} ;按照Burst伞形发射，分割的角度", "按照Burst伞形发射，分割的角度", attachFire));
        res.push(makeCompletionItem("SimulateBurst", "SimulateBurst=${1:no} ;模拟原版的Burst有延迟的发射每一个武器", "模拟原版的Burst有延迟的发射每一个武器", attachFire));
        res.push(makeCompletionItem("SimulateBurstDelay", "SimulateBurstDelay=${1:7} ;模拟原版的Burst时每次发射的间隔", "模拟原版的Burst时每次发射的间隔", attachFire));
        res.push(makeCompletionItem("SimulateBurstMode", "SimulateBurstMode=${1:0} ;模拟原版的Burst模式，当FLH的L不为0时，0=不切换左右，1=LRLRLRLR，2=LLLLRRRR，3=LR*Burst", "模拟原版的Burst模式，当FLH的L不为0时，0=不切换左右，1=LRLRLRLR，2=LLLLRRRR，3=LR*Burst", attachFire));
        res.push(makeCompletionItem("OnlyFireInTransport", "OnlyFireInTransport=${1:no} ;只有在载具内才能使用这个附加武器", "只有在载具内才能使用这个附加武器", attachFire));
        res.push(makeCompletionItem("UseAlternateFLH", "UseAlternateFLH=${1:no} ;在载具内时，不使用AttachFire指定的FLH而是启用载具对应的FLH", "在载具内时，不使用AttachFire指定的FLH而是启用载具对应的FLH", attachFire));
    }


    const extraFire = [
        "[TechnoType]",
        "ExtraFire.Primary=RedEye2,RadBeamWeapon,ElectricBolt",
        "ExtraFire.ElitePrimary=RedEye2,RadBeamWeapon,ElectricBolt",
        "ExtraFire.Secondary=RedEye2",
        "ExtraFire.EliteSecondary=RedEye2",
        "ExtraFire.WeaponX=RedEye2,RadBeamWeapon,ElectricBolt ;适用于WeaponX的附加武器设置，X=1\\2\\3\\4，不会覆盖Primary和Secondary",
        "ExtraFire.EliteWeaponX=RedEye2,RadBeamWeapon,ElectricBolt ;适用于WeaponX的附加武器设置，X=1\\2\\3\\4，不会覆盖Primary和Secondary"
    ];
    const extraFireFLH = [
        "[TechnoTypeArt]",
        "ExtraFire.PrimaryFLH=0,0,0",
        "ExtraFire.ElitePrimaryFLH=0,0,0",
        "ExtraFire.SecondaryFLH=0,0,0",
        "ExtraFire.EliteSecondaryFLH=0,0,0",
        "ExtraFire.WeaponXFLH=0,0,0 ;适用于WeaponX的附加武器设置，X=1\\2\\3\\4，不会覆盖Primary和Secondary",
        "ExtraFire.EliteWeaponXFLH=0,0,0 ;适用于WeaponX的附加武器设置，X=1\\2\\3\\4，不会覆盖Primary和Secondary"
    ];
    // 附加武器，在主武器/副武器发射的同时发射附加的多个武器，附加武器受单位的精英技能和宝箱加成影响
    if (/^E[xtraFire]{0,8}$/g.test(lineText)) {
        res.push(makeCompletionItem("ExtraFire", "ExtraFire", "单位主武器开火时附带的额外武器", extraFire));
        res.push(makeCompletionItem("ExtraFire.Primary", "ExtraFire.Primary=$0 ;单位主武器开火时附带的额外武器，可以是多个", "单位主武器开火时附带的额外武器，可以是多个", extraFire));
        res.push(makeCompletionItem("ExtraFire.ElitePrimary", "ExtraFire.ElitePrimary=$0 ;精英单位主武器开火时附带的额外武器，可以是多个", "精英单位主武器开火时附带的额外武器，可以是多个", extraFire));
        res.push(makeCompletionItem("ExtraFire.Secondary", "ExtraFire.Secondary=$0 ;单位副武器开火时附带的额外武器，可以是多个", "单位副武器开火时附带的额外武器，可以是多个", extraFire));
        res.push(makeCompletionItem("ExtraFire.EliteSecondary", "ExtraFire.EliteSecondary=$0 ;精英单位副武器开火时附带的额外武器，可以是多个", "精英单位副武器开火时附带的额外武器，可以是多个", extraFire));
        res.push(makeCompletionItem("ExtraFire.WeaponX", "ExtraFire.Weapon${1:1}=$0 ;适用于WeaponX的附加武器设置，X=1\\2\\3\\4，不会覆盖Primary和Secondary", "适用于WeaponX的附加武器设置，X=1\\2\\3\\4，不会覆盖Primary和Secondary", extraFire));
        res.push(makeCompletionItem("ExtraFire.EliteWeaponX", "ExtraFire.EliteWeapon${1:1}=$0 ;适用于WeaponX的附加武器设置，X=1\\2\\3\\4，不会覆盖Primary和Secondary", "适用于WeaponX的附加武器设置，X=1\\2\\3\\4，不会覆盖Primary和Secondary", extraFire));
        // art
        res.push(makeCompletionItem("ExtraFire.PrimaryFLH", "ExtraFire.PrimaryFLH=${1:0},${2:0},${3:0} ;主武器附带武器开火坐标", "主武器附带武器开火坐标", extraFireFLH));
        res.push(makeCompletionItem("ExtraFire.ElitePrimaryFLH", "ExtraFire.ElitePrimaryFLH=${1:0},${2:0},${3:0} ;精英主武器附带武器开火坐标", "主武器附带武器开火坐标", extraFireFLH));
        res.push(makeCompletionItem("ExtraFire.SecondaryFLH", "ExtraFire.SecondaryFLH=${1:0},${2:0},${3:0} ;副武器附带武器开火坐标", "副武器附带武器开火坐标", extraFireFLH));
        res.push(makeCompletionItem("ExtraFire.EliteSecondaryFLH", "ExtraFire.EliteSecondaryFLH=${1:0},${2:0},${3:0} ;精英副武器附带武器开火坐标", "精英副武器附带武器开火坐标", extraFireFLH));
        res.push(makeCompletionItem("ExtraFire.WeaponXFLH", "ExtraFire.Weapon${1:0}FLH=${2:0},${3:0},${4:0} ;适用于WeaponX的附加武器设置，X=1\\2\\3\\4，不会覆盖Primary和Secondary", "适用于WeaponX的附加武器设置，X=1\\2\\3\\4，不会覆盖Primary和Secondary", extraFireFLH));
        res.push(makeCompletionItem("ExtraFire.EliteWeaponXFLH", "ExtraFire.EliteWeapon${1:0}FLH=${2:0},${3:0},${4:0} ;适用于WeaponX的附加武器设置，X=1\\2\\3\\4，不会覆盖Primary和Secondary", "适用于WeaponX的附加武器设置，X=1\\2\\3\\4，不会覆盖Primary和Secondary", extraFireFLH));
    }
    if (/^ExtraFire\.(.(?!\=))*$/g.test(lineText)) {
        res.push(makeCompletionItem("Primary", "Primary=$0 ;单位主武器开火时附带的额外武器，可以是多个", "单位主武器开火时附带的额外武器，可以是多个", extraFire));
        res.push(makeCompletionItem("ElitePrimary", "ElitePrimary=$0 ;精英单位主武器开火时附带的额外武器，可以是多个", "精英单位主武器开火时附带的额外武器，可以是多个", extraFire));
        res.push(makeCompletionItem("Secondary", "Secondary=$0 ;单位副武器开火时附带的额外武器，可以是多个", "单位副武器开火时附带的额外武器，可以是多个", extraFire));
        res.push(makeCompletionItem("EliteSecondary", "EliteSecondary=$0 ;精英单位副武器开火时附带的额外武器，可以是多个", "精英单位副武器开火时附带的额外武器，可以是多个", extraFire));
        res.push(makeCompletionItem("WeaponX", "Weapon${1:1}=$0 ;适用于WeaponX的附加武器设置，X=1\\2\\3\\4，不会覆盖Primary和Secondary", "适用于WeaponX的附加武器设置，X=1\\2\\3\\4，不会覆盖Primary和Secondary", extraFire));
        res.push(makeCompletionItem("EliteWeaponX", "EliteWeapon${1:1}=$0 ;适用于WeaponX的附加武器设置，X=1\\2\\3\\4，不会覆盖Primary和Secondary", "适用于WeaponX的附加武器设置，X=1\\2\\3\\4，不会覆盖Primary和Secondary", extraFire));
        // art
        res.push(makeCompletionItem("PrimaryFLH", "PrimaryFLH=${1:0},${2:0},${3:0} ;主武器附带武器开火坐标", "主武器附带武器开火坐标", extraFireFLH));
        res.push(makeCompletionItem("ElitePrimaryFLH", "ElitePrimaryFLH=${1:0},${2:0},${3:0} ;精英主武器附带武器开火坐标", "主武器附带武器开火坐标", extraFireFLH));
        res.push(makeCompletionItem("SecondaryFLH", "SecondaryFLH=${1:0},${2:0},${3:0} ;副武器附带武器开火坐标", "副武器附带武器开火坐标", extraFireFLH));
        res.push(makeCompletionItem("EliteSecondaryFLH", "EliteSecondaryFLH=${1:0},${2:0},${3:0} ;精英副武器附带武器开火坐标", "精英副武器附带武器开火坐标", extraFireFLH));
        res.push(makeCompletionItem("WeaponXFLH", "Weapon${1:0}FLH=${2:0},${3:0},${4:0} ;适用于WeaponX的附加武器设置，X=1\\2\\3\\4，不会覆盖Primary和Secondary", "适用于WeaponX的附加武器设置，X=1\\2\\3\\4，不会覆盖Primary和Secondary", extraFireFLH));
        res.push(makeCompletionItem("EliteWeaponXFLH", "EliteWeapon${1:0}FLH=${2:0},${3:0},${4:0} ;适用于WeaponX的附加武器设置，X=1\\2\\3\\4，不会覆盖Primary和Secondary", "适用于WeaponX的附加武器设置，X=1\\2\\3\\4，不会覆盖Primary和Secondary", extraFireFLH));
    }
    if (/^ExtraFire+\.(Elite)*(Primary|Secondary|(Weapon\d+))+=/g.test(lineText)) {
        const v = makeCompletionItemFromSection("WeaponTypes");
        res = res.concat(v);
    }


    const rocker = [
        "[WeaponType]",
        "RockerPitch=0.0 ;抬起角度，0-1，0是水平，1是垂直（实际只能推到45°），推荐值0.02"
    ];
    // 抬头模拟后座力
    if (/^R[ockerPitch]{0,10}$/g.test(lineText)) {
        res.push(makeCompletionItem("RockerPitch", "RockerPitch=${1:0.0} ;抬起角度，0-1，0是水平，1是垂直（实际只能推到45°），推荐值0.02", "抬起角度，0-1，0是水平，1是垂直（实际只能推到45°），推荐值0.02", rocker));
    }


    const rot = [
        "[ProjectileType]",
        "ROT.Reverse=no ;导弹向反方向发射",
        "ROT.ReverseZ=no ;是否翻转Z方向",
        "ROT.ShakeMultiplier=0.0 ;微调晃动导弹类型抛射体初始方向，从0到1取随机值乘以设定的系数"
    ];
    // 翻转导弹类型抛射体初始发射方向，不翻转Z方向
    if (/^R[OT]{0,2}$/g.test(lineText)) {
        res.push(makeCompletionItem("ROT.Reverse", "ROT.Reverse=${1:no} ;导弹向反方向发射", "导弹向反方向发射", rot));
        res.push(makeCompletionItem("ROT.ReverseZ", "ROT.ReverseZ=${1:no} ;是否翻转Z方向", "是否翻转Z方向", rot));
        // 微调晃动导弹类型抛射体初始方向，从0到1取随机值乘以设定的系数
        res.push(makeCompletionItem("ROT.ShakeMultiplier", "ROT.ShakeMultiplier=${1:0.0} ;微调晃动导弹类型抛射体初始方向，从0到1取随机值乘以设定的系数", "微调晃动导弹类型抛射体初始方向，从0到1取随机值乘以设定的系数", rot));
    }
    if (/^ROT\./g.test(lineText)) {
        res.push(makeCompletionItem("Reverse", "Reverse=${1:no} ;导弹向反方向发射", "导弹向反方向发射", rot));
        res.push(makeCompletionItem("ReverseZ", "ReverseZ=${1:no} ;是否翻转Z方向", "是否翻转Z方向", rot));
        // 微调晃动导弹类型抛射体初始方向，从0到1取随机值乘以设定的系数
        res.push(makeCompletionItem("ShakeMultiplier", "ShakeMultiplier=${1:0.0} ;微调晃动导弹类型抛射体初始方向，从0到1取随机值乘以设定的系数", "微调晃动导弹类型抛射体初始方向，从0到1取随机值乘以设定的系数", rot));
    }

    const virtual = [
        "[TechnoType]",
        "VirtualUnit=no ;虚拟单位，不存在于地图上，无法被选中",
        "",
        "[AttachEffectType]",
        "Stand.VirtualUnit=no ;虚拟单位，不存在于地图上，无法被选中"
    ];
    // 虚单位
    if (/^V[irtualUnit]{0,10}$/g.test(lineText)) {
        res.push(makeCompletionItem("VirtualUnit", "VirtualUnit=${1:no} ;虚拟单位，不存在于地图上，无法被选中", "虚拟单位，不存在于地图上，无法被选中", virtual));
    }

    const useAE = [
        "[AttachEffectTypes] ;全新注册表",
        "+=AutoWeapon1",
        "+=StandTest1",
        "",
        "[TechnoType]",
        "[ProjectileType]",
        "[WarheadType]",
        "AttachEffectTypes=AutoWeapon1,StandTest1 ;要挂载的AE类型，写弹头上表示被该弹头伤害到的单位挂载",
        "StandTrainCabinLength=512 ;火车类型的替身的车厢长度，影响替身之间的间隔",
        "AffectsAir=yes ;使用弹头附加效果是否影响空中单位的总开关（注意Affects有s）",
        "AffectsBullet=no ;使用弹头附加效果是否影响抛射体的总开关（注意Affects有s）"
    ];
    // AE
    if (/^A[ttachEffectTypes]{0,16}$/g.test(lineText)) {
        res.push(makeCompletionItem("AttachEffectTypes", "AttachEffectTypes=$0 ;要挂载的AE类型，写弹头上表示被该弹头伤害到的单位挂载", "要挂载的AE类型，写弹头上表示被该弹头伤害到的单位挂载", useAE));
    }
    if (/^AttachEffectTypes\=/g.test(lineText)) {
        const v = makeCompletionItemFromSection("AttachEffectTypes");
        res = res.concat(v);
    }
    if (/^S[tandTrainCabinLength]{0,20}$/g.test(lineText)) {
        res.push(makeCompletionItem("StandTrainCabinLength", "StandTrainCabinLength=${1:512} ;火车类型的替身的车厢长度，影响替身之间的间隔", "火车类型的替身的车厢长度，影响替身之间的间隔", useAE));
    }
    if (/^A[ffectsAir]{0,9}$/g.test(lineText)) {
        res.push(makeCompletionItem("AffectsAir", "AffectsAir=${1:yes} ;使用弹头附加效果是否影响空中单位的总开关（注意Affects有s）", "使用弹头附加效果是否影响空中单位的总开关（注意Affects有s）", useAE));
    }
    if (/^A[ffectsBullet]{0,12}$/g.test(lineText)) {
        res.push(makeCompletionItem("AffectsBullet", "AffectsBullet=${1:no} ;使用弹头附加效果是否影响抛射体的总开关（注意Affects有s）", "使用弹头附加效果是否影响抛射体的总开关（注意Affects有s）", useAE));
    }

    const ae = [
        "[AttachEffectType]",
        "; 通用设置",
        "Duration=1 ;持续时间，设置的值大于0，将启动计时器。负值时该AE不被赋予，但赋予时如果遇到同组的AE将削减其持续时间并启动有效期计时",
        "HoldDuration=yes ;不进行有效期计时，即无限时间",
        "ResetDurationOnReapply=no ;如果不允许叠加，持续过程中重复赋予时是否重置计时器",
        "Delay=0 ;替身消失后多久无法再获得",
        "RandomDelay=0,1 ;随机Delay，设置最小值和最大值，如果设置上一条不起作用",
        "InitialDelay=0 ;获得AE后多久生效",
        "InitialRandomDelay=0,1 ;随机初始延迟，设置最小值和最大值，如果设置上一条不起作用",
        "DiscardOnEntry=no ;离开地图后是否即刻失效",
        "PenetratesIronCurtain=no ;用于弹头附加时是否穿透铁幕",
        "FromTransporter=yes ;乘客使用弹头附加时，视为乘坐的载具使用弹头附加",
        "OwnerTarget=no ;用于弹头附加时，AE属于被赋予对象",
        "Cumulative=no ;是否允许同名AE进行叠加，yes=可叠加作用；no=不可叠加；attacker=来源不同的攻击者允许叠加",
        "Group=-1 ;分组，同一个分组的效果互相影响，削减或增加持续时间",
        "OverrideSameGroup=no ;同一个分组已存在，再赋予则覆盖",
        "Next=StandTest1 ;AE结束后进入下一个AE"
    ];
    const aeAnim = [
        "[AttachEffectType]",
        "; AE动画",
        "Animation=none ;持续动画",
        "ActiveAnim=none ;激活时的动画",
        "HitAnim=none ;被击中的动画",
        "DoneAnim=none ;结束时的动画",
    ];
    const aeAttach = [
        "[AttachEffectType]",
        "; 赋予方式",
        "AttachOnceInTechnoType=no ;用于出厂附加时，只在单位生成时附加一次，不会在Delay后重新获得",
        "AttachWithDamage=no ;用于弹头附加时，随着伤害附加，而不是按弹头爆炸位置附加，如在使用AmbientDamage时"
    ];
    const aeFilter = [
        "[AttachEffectType]",
        "; 赋予对象过滤器专属设置",
        "AffectTypes=none ;可影响的单位，如果设置，则只可以影响列表中的单位",
        "NotAffectTypes=none ;不可影响的单位，如果设置，则列表中的单位不接收该AE，比AffectTypes优先级更高",
        "AffectBullet=no ;用于弹头附加时，赋予半径CellSpread范围内的抛射体 (注意Affect没有s)",
        "OnlyAffectBullet=no ;用于弹头附加时，只影响抛射体，不影响单位 (注意Affect没有s)",
        "AffectMissile=yes ;用于弹头附加时，影响ROT>0的抛射体",
        "AffectTorpedo=yes ;用于弹头附加时，影响Level=yes的抛射体",
        "AffectCannon=no ;用于弹头附加时，影响Arcing=yes的抛射体"
    ];
    // AE通用设置
    if (/(^A[nimation]{0,8}$)|(^A[ctiveAnim]{0,9}$)|(^H[itAnim]{0,6}$)|(^D[oneAnim]{0,7}$)/g.test(lineText)) {
        res.push(makeCompletionItem("Animation", "Animation=$0", "动画"));
        res.push(makeCompletionItem("ActiveAnim", "ActiveAnim=$0 ;激活时的动画", "激活时的动画", aeAnim));
        res.push(makeCompletionItem("HitAnim", "HitAnim=$0 ;被击中的动画", "被击中的动画", aeAnim));
        res.push(makeCompletionItem("DoneAnim", "DoneAnim=$0 ;结束时的动画", "结束时的动画", aeAnim));
    }
    if (/(^Animation\=)|(^ActiveAnim\=)|(^HitAnim\=)|(^DoneAnim\=)/g.test(lineText)) {
        const v = makeCompletionItemFromSection("Animations");
        res = res.concat(v);
    }
    if (/(^D[uration]{0,7}$)|(^H[oldDuration]{0,11}$)|(^R[esetDurationOnReapply]{0,21}$)/g.test(lineText)) {
        res.push(makeCompletionItem("Duration", "Duration=${1:1} ;持续时间，设置的值大于0，将启动计时器。负值时该AE不被赋予，但赋予时如果遇到同组的AE将削减其持续时间并启动有效期计时", "持续时间，设置的值大于0，将启动计时器。负值时该AE不被赋予，但赋予时如果遇到同组的AE将削减其持续时间并启动有效期计时", ae));
        res.push(makeCompletionItem("HoldDuration", "HoldDuration=${1:yes} ;不进行有效期计时，即无限时间", "不进行有效期计时，即无限时间", ae));
        res.push(makeCompletionItem("ResetDurationOnReapply", "ResetDurationOnReapply=${1:no} ;如果不允许叠加，持续过程中重复赋予时是否重置计时器", "如果不允许叠加，持续过程中重复赋予时是否重置计时器", ae));
    }
    if (/(^D[elay]{0,8}$)|(^R[andomDelay]{0,10}$)|(^I[nitialDelay]{0,11}$)|(^I[nitialRandomDelay]{0,17}$)/g.test(lineText)) {
        res.push(makeCompletionItem("Delay", "Delay=${1:0} ;替身消失后多久无法再获得", "替身消失后多久无法再获得", ae));
        res.push(makeCompletionItem("RandomDelay", "RandomDelay=${1:0,1} ;随机Delay，设置最小值和最大值，如果设置上一条不起作用", "随机Delay，设置最小值和最大值，如果设置上一条不起作用", ae));
        res.push(makeCompletionItem("InitialDelay", "InitialDelay=${1:0} ;获得AE后多久生效", "获得AE后多久生效", ae));
        res.push(makeCompletionItem("InitialRandomDelay", "InitialRandomDelay=${1:0,1} ;随机初始延迟，设置最小值和最大值，如果设置上一条不起作用", "随机初始延迟，设置最小值和最大值，如果设置上一条不起作用", ae));
    }
    if (/^D[iscardOnEntry]{0,13}$/g.test(lineText)) {
        res.push(makeCompletionItem("DiscardOnEntry", "DiscardOnEntry=${1:no} ;离开地图后是否即刻失效", "离开地图后是否即刻失效", ae));
    }
    if (/^C[umulative]{0,9}$/g.test(lineText)) {
        res.push(makeCompletionItem("Cumulative", "Cumulative=${1:no} ;是否允许同名AE进行叠加，yes=可叠加作用；no=不可叠加；attacker=来源不同的攻击者允许叠加", "是否允许同名AE进行叠加，yes=可叠加作用；no=不可叠加；attacker=来源不同的攻击者允许叠加", ae));
    }
    if (/^P[enetratesIronCurtain]{0,20}$/g.test(lineText)) {
        res.push(makeCompletionItem("PenetratesIronCurtain", "PenetratesIronCurtain=${1:no} ;用于弹头附加时是否穿透铁幕", "用于弹头附加时是否穿透铁幕", ae));
    }
    if (/^N[ext]{0,3}$/g.test(lineText)) {
        res.push(makeCompletionItem("Next", "Next=${1:StandTest1} ;AE结束后进入下一个AE", "AE结束后进入下一个AE", ae));
    }
    if (/(^F[romTransporter]{0,14}$)|(^O[wnerTarget]{0,10}$)/g.test(lineText)) {
        res.push(makeCompletionItem("FromTransporter", "FromTransporter=${1:yes} ;乘客使用弹头附加时，视为乘坐的载具使用弹头附加", "乘客使用弹头附加时，视为乘坐的载具使用弹头附加", ae));
        res.push(makeCompletionItem("OwnerTarget", "OwnerTarget=${1:no} ;用于弹头附加时，AE属于被赋予对象", "用于弹头附加时，AE属于被赋予对象", ae));
    }
    if (/(^G[roup]{0,4}$)|(^O[verrideSameGroup]{0,16}$)/g.test(lineText)) {
        res.push(makeCompletionItem("Group", "Group=${1:-1} ;分组，同一个分组的效果互相影响，削减或增加持续时间", "分组，同一个分组的效果互相影响，削减或增加持续时间", ae));
        res.push(makeCompletionItem("OverrideSameGroup", "OverrideSameGroup=${1:no} ;同一个分组已存在，再赋予则覆盖", "同一个分组已存在，再赋予则覆盖", ae));
    }
    // 附加方式
    if (/(^A[ttachOnceInTechnoType]{0,21}$)|(^A[ttachWithDamage]{0,15}$)/g.test(lineText)) {
        res.push(makeCompletionItem("AttachOnceInTechnoType", "AttachOnceInTechnoType=${1:no} ;用于出厂附加时，只在单位生成时附加一次，不会在Delay后重新获得", "用于出厂附加时，只在单位生成时附加一次，不会在Delay后重新获得", aeAttach));
        res.push(makeCompletionItem("AttachWithDamage", "AttachWithDamage=${1:no} ;用于弹头附加时，随着伤害附加，而不是按弹头爆炸位置附加，如在使用AmbientDamage时", "用于弹头附加时，随着伤害附加，而不是按弹头爆炸位置附加，如在使用AmbientDamage时", aeAttach));
    }
    // 赋予对象过滤器
    if (/(^A[ffectTypes]{0,10}$)|(^N[otAffectTypes]{0,13}$)/g.test(lineText)) {
        res.push(makeCompletionItem("AffectTypes", "AffectTypes=$0 ;可影响的单位，如果设置，则只可以影响列表中的单位", "可影响的单位，如果设置，则只可以影响列表中的单位", aeFilter));
        res.push(makeCompletionItem("NotAffectTypes", "NotAffectTypes=$0 ;不可影响的单位，如果设置，则列表中的单位不接收该AE，比AffectTypes优先级更高", "不可影响的单位，如果设置，则列表中的单位不接收该AE，比AffectTypes优先级更高", aeFilter));
    }
    if (/(^AffectTypes\=)|(NotAffectTypes\=)/g.test(lineText)) {
        const i = makeCompletionItemFromSection("InfantryTypes");
        res = res.concat(i);
        const v = makeCompletionItemFromSection("VehicleTypes");
        res = res.concat(v);
        const b = makeCompletionItemFromSection("BuildingTypes");
        res = res.concat(b);
    }
    if (/(^A[ffectBullet]{0,11}$)|(^O[nlyAffectBullet]{0,15}$)|(^A[ffectMissile]{0,12}$)|(^A[ffectTorpedo]{0,12}$)|(^A[ffectCannon]{0,11}$)/g.test(lineText)) {
        res.push(makeCompletionItem("AffectBullet", "AffectBullet=${1:no} ;用于弹头附加时，赋予半径CellSpread范围内的抛射体 (注意Affect没有s)", "用于弹头附加时，赋予半径CellSpread范围内的抛射体 (注意Affect没有s)", aeFilter));
        res.push(makeCompletionItem("OnlyAffectBullet", "OnlyAffectBullet=${1:no} ;用于弹头附加时，只影响抛射体，不影响单位 (注意Affect没有s)", "用于弹头附加时，只影响抛射体，不影响单位 (注意Affect没有s)", aeFilter));
        res.push(makeCompletionItem("AffectMissile", "AffectMissile=${1:yes} ;用于弹头附加时，影响ROT>0的抛射体", "用于弹头附加时，影响ROT>0的抛射体", aeFilter));
        res.push(makeCompletionItem("AffectTorpedo", "AffectTorpedo=${1:yes} ;用于弹头附加时，影响Level=yes的抛射体", "用于弹头附加时，影响Level=yes的抛射体", aeFilter));
        res.push(makeCompletionItem("AffectCannon", "AffectCannon=${1:no} ;用于弹头附加时，影响Arcing=yes的抛射体", "用于弹头附加时，影响Arcing=yes的抛射体", aeFilter));
    }
    const aeStatus = [
        "[AttachEffectType]",
        "; 属性专属设置",
        "Status.FirepowerMultiplier=1.0 ;伤害系数",
        "Status.ArmorMultiplier=1.0 ;防御系数",
        "Status.SpeedMultiplier=1.0 ;速度系数",
        "Status.Cloakable=no ;隐形"
    ];
    // AE属性
    if (/^S[tatus]{0,5}$/g.test(lineText)) {
        res.push(makeCompletionItem("Status", "Status", "AE属性变化", aeStatus));
        res.push(makeCompletionItem("Status.FirepowerMultiplier", "Status.FirepowerMultiplier=${1:1.0} ;伤害系数", "伤害系数", aeStatus));
        res.push(makeCompletionItem("Status.ArmorMultiplier", "Status.ArmorMultiplier=${1:1.0} ;防御系数", "防御系数", aeStatus));
        res.push(makeCompletionItem("Status.SpeedMultiplier", "Status.SpeedMultiplier=${1:1.0} ;速度系数", "速度系数", aeStatus));
        res.push(makeCompletionItem("Status.Cloakable", "Status.Cloakable=${1:no} ;隐形", "隐形", aeStatus));
    }
    if (/^Status\./g.test(lineText)) {
        res.push(makeCompletionItem("FirepowerMultiplier", "FirepowerMultiplier=${1:1.0} ;伤害系数", "伤害系数", aeStatus));
        res.push(makeCompletionItem("ArmorMultiplier", "ArmorMultiplier=${1:1.0} ;防御系数", "防御系数", aeStatus));
        res.push(makeCompletionItem("SpeedMultiplier", "SpeedMultiplier=${1:1.0} ;速度系数", "速度系数", aeStatus));
        res.push(makeCompletionItem("Cloakable", "Cloakable=${1:no} ;隐形", "隐形", aeStatus));
    }
    const aeStand = [
        "[AttachEffectType]",
        "; 替身专属设置",
        "Stand.Type=APOC ;替身类型，可以是虚拟单位",
        "Stand.Offset=0,0,0 ;替身的位置，单位的FLH，+F在建筑的右下方，",
        "Stand.Direction=0 ;替身的初始朝向，[0-15]，16分圆，0是替身前方，单位为右上，建筑为右下，16方向：N=0、NE=2、E=4、SE=6、S=8、SW=10、W=12、NW=14",
        "Stand.LockDirection=no ;强制固定替身朝向始终保持与使者的方位，无论替身是否正在攻击目标",
        "Stand.IsOnTurret=no ;替身绑定在炮管上",
        "Stand.IsOnWorld=no ;替身绑定位置以世界坐标做参考，固定朝向北方，不跟随转动",
        "Stand.DrawLayer=None ;替身的渲染层设置，当ZOffset不为0时启用，NONE为自动识别，NONE\\UNDERGROUND\\SURFACE\\GROUND\\AIR\\TOP",
        "Stand.ZOffset=12 ;替身在ZAdjust偏移值，正值在上层，负值在下层，火车类型无效",
        "Stand.SameHouse=yes ;替身跟随附属对象的所属变化，本体属性变化如心控，替身所属也跟随变化",
        "Stand.SameTarget=yes ;强制替身与使者攻击同一个目标",
        "Stand.SameLoseTarget=no ;使者失去目标同时替身也失去",
        "Stand.ForceAttackMaster=no ;替身强制选定使者为目标",
        "Stand.MobileFire=yes ;使者在移动时替身仍可攻击",
        "Stand.Powered=no ;替身需要电力支持才能攻击",
        "Stand.Explodes=no ;替身死亡时爆炸",
        "Stand.ExplodesWithMaster=no ;替身在JOJO死亡时爆炸，覆盖上一条设置",
        "Stand.RemoveAtSinking=no ;发生沉船时移除",
        "Stand.PromoteFormMaster=no ;强制替身等级与使者相同",
        "Stand.ExperienceToMaster=0.0 ;替身可以训练时，分多少经验给使者，替身不能训练时，击杀100%经验转给使者",
        "Stand.VirtualUnit=no ;虚拟单位",
        "Stand.SameTilter=yes ;替身和使者同为Drive Locomotor时，强制同步替身的倾斜角度。关闭时Drive Loco的替身会自行根据所处的格子倾斜自身。",
        "Stand.IsTrain=no ;火车类型的替身，特殊表现，跟随使者行动轨迹",
        "Stand.IsCabinHead=no ;火车类型的替身，在生成时是否插入车厢组前端",
        "Stand.CabinGroup=-1 ;火车类型的替身，车厢的分组"
    ];
    // AE属性
    if (/^S[tand]{0,4}$/g.test(lineText)) {
        res.push(makeCompletionItem("Stand", "Stand", "AE替身", aeStand));
        res.push(makeCompletionItem("Stand.Type", "Stand.Type=$0 ;替身类型，可以是虚拟单位", "替身类型，可以是虚拟单位", aeStand));
        res.push(makeCompletionItem("Stand.Offset", "Stand.Offset=${1:0},${2:0},${3:0} ;替身的位置，单位的FLH，+F在建筑的右下方，", "替身的位置，单位的FLH，+F在建筑的右下方，", aeStand));
        res.push(makeCompletionItem("Stand.Direction", "Stand.Direction=${1:0} ;替身的初始朝向，[0-15]，16分圆，0是替身前方，单位为右上，建筑为右下，16方向：N=0、NE=2、E=4、SE=6、S=8、SW=10、W=12、NW=14", "替身的初始朝向，[0-15]，16分圆，0是替身前方，单位为右上，建筑为右下，16方向：N=0、NE=2、E=4、SE=6、S=8、SW=10、W=12、NW=14", aeStand));
        res.push(makeCompletionItem("Stand.LockDirection", "Stand.LockDirection=${1:no} ;强制固定替身朝向始终保持与使者的方位，无论替身是否正在攻击目标", "强制固定替身朝向始终保持与使者的方位，无论替身是否正在攻击目标", aeStand));
        res.push(makeCompletionItem("Stand.IsOnTurret", "Stand.IsOnTurret=${1:no} ;替身绑定在炮管上", "替身绑定在炮管上", aeStand));
        res.push(makeCompletionItem("Stand.IsOnWorld", "Stand.IsOnWorld=${1:no} ;替身绑定位置以世界坐标做参考，固定朝向北方，不跟随转动", "替身绑定位置以世界坐标做参考，固定朝向北方，不跟随转动", aeStand));
        res.push(makeCompletionItem("Stand.DrawLayer", "Stand.DrawLayer=$0 ;替身的渲染层设置，当ZOffset不为0时启用，NONE为自动识别，NONE\\UNDERGROUND\\SURFACE\\GROUND\\AIR\\TOP", "替身的渲染层设置，当ZOffset不为0时启用，NONE为自动识别，NONE\\UNDERGROUND\\SURFACE\\GROUND\\AIR\\TOP", aeStand));
        res.push(makeCompletionItem("Stand.ZOffset", "Stand.ZOffset=${1:12} ;替身在ZAdjust偏移值，正值在上层，负值在下层，火车类型无效", "替身在ZAdjust偏移值，正值在上层，负值在下层，火车类型无效", aeStand));
        res.push(makeCompletionItem("Stand.SameHouse", "Stand.SameHouse=${1:yes} ;替身跟随附属对象的所属变化，本体属性变化如心控，替身所属也跟随变化", "替身跟随附属对象的所属变化，本体属性变化如心控，替身所属也跟随变化", aeStand));
        res.push(makeCompletionItem("Stand.SameTarget", "Stand.SameTarget=${1:yes} ;强制替身与使者攻击同一个目标", "强制替身与使者攻击同一个目标", aeStand));
        res.push(makeCompletionItem("Stand.SameLoseTarget", "Stand.SameLoseTarget=${1:no} ;使者失去目标同时替身也失去", "使者失去目标同时替身也失去", aeStand));
        res.push(makeCompletionItem("Stand.ForceAttackMaster", "Stand.ForceAttackMaster=${1:no} ;替身强制选定使者为目标", "替身强制选定使者为目标", aeStand));
        res.push(makeCompletionItem("Stand.MobileFire", "Stand.MobileFire=${1:yes} ;使者在移动时替身仍可攻击", "使者在移动时替身仍可攻击", aeStand));
        res.push(makeCompletionItem("Stand.Powered", "Stand.Powered=${1:no} ;替身需要电力支持才能攻击", "替身需要电力支持才能攻击", aeStand));
        res.push(makeCompletionItem("Stand.Explodes", "Stand.Explodes=${1:no} ;替身死亡时爆炸", "替身死亡时爆炸", aeStand));
        res.push(makeCompletionItem("Stand.ExplodesWithMaster", "Stand.ExplodesWithMaster=${1:no} ;替身在JOJO死亡时爆炸，覆盖上一条设置", "替身在JOJO死亡时爆炸，覆盖上一条设置", aeStand));
        res.push(makeCompletionItem("Stand.RemoveAtSinking", "Stand.RemoveAtSinking=${1:no} ;发生沉船时移除", "发生沉船时移除", aeStand));
        res.push(makeCompletionItem("Stand.PromoteFormMaster", "Stand.PromoteFormMaster=${1:no} ;强制替身等级与使者相同", "强制替身等级与使者相同", aeStand));
        res.push(makeCompletionItem("Stand.ExperienceToMaster", "Stand.ExperienceToMaster=${1:0.0} ;替身可以训练时，分多少经验给使者，替身不能训练时，击杀100%经验转给使者", "替身可以训练时，分多少经验给使者，替身不能训练时，击杀100%经验转给使者", aeStand));
        res.push(makeCompletionItem("Stand.VirtualUnit", "Stand.VirtualUnit=${1:no} ;虚拟单位", "虚拟单位", aeStand));
        res.push(makeCompletionItem("Stand.SameTilter", "Stand.SameTilter=${1:yes} ;替身和使者同为Drive Locomotor时，强制同步替身的倾斜角度。关闭时Drive Loco的替身会自行根据所处的格子倾斜自身。", "替身和使者同为Drive Locomotor时，强制同步替身的倾斜角度。关闭时Drive Loco的替身会自行根据所处的格子倾斜自身。", aeStand));
        res.push(makeCompletionItem("Stand.IsTrain", "Stand.IsTrain=${1:no} ;火车类型的替身，特殊表现，跟随使者行动轨迹", "火车类型的替身，特殊表现，跟随使者行动轨迹", aeStand));
        res.push(makeCompletionItem("Stand.IsCabinHead", "Stand.IsCabinHead=${1:no} ;火车类型的替身，在生成时是否插入车厢组前端", "火车类型的替身，在生成时是否插入车厢组前端", aeStand));
        res.push(makeCompletionItem("Stand.CabinGroup", "Stand.CabinGroup=${1:-1} ;火车类型的替身，车厢的分组", "火车类型的替身，车厢的分组", aeStand));
    }
    if (/^Stand\.(.(?!\=))*$/g.test(lineText)) {
        res.push(makeCompletionItem("Type", "Type=$0 ;替身类型，可以是虚拟单位", "替身类型，可以是虚拟单位", aeStand));
        res.push(makeCompletionItem("Offset", "Offset=${1:0},${2:0},${3:0} ;替身的位置，单位的FLH，+F在建筑的右下方，", "替身的位置，单位的FLH，+F在建筑的右下方，", aeStand));
        res.push(makeCompletionItem("Direction", "Direction=${1:0} ;替身的初始朝向，[0-15]，16分圆，0是替身前方，单位为右上，建筑为右下，16方向：N=0、NE=2、E=4、SE=6、S=8、SW=10、W=12、NW=14", "替身的初始朝向，[0-15]，16分圆，0是替身前方，单位为右上，建筑为右下，16方向：N=0、NE=2、E=4、SE=6、S=8、SW=10、W=12、NW=14", aeStand));
        res.push(makeCompletionItem("LockDirection", "LockDirection=${1:no} ;强制固定替身朝向始终保持与使者的方位，无论替身是否正在攻击目标", "强制固定替身朝向始终保持与使者的方位，无论替身是否正在攻击目标", aeStand));
        res.push(makeCompletionItem("IsOnTurret", "IsOnTurret=${1:no} ;替身绑定在炮管上", "替身绑定在炮管上"));
        res.push(makeCompletionItem("IsOnWorld", "IsOnWorld=${1:no} ;替身绑定位置以世界坐标做参考，固定朝向北方，不跟随转动", "替身绑定位置以世界坐标做参考，固定朝向北方，不跟随转动", aeStand));
        res.push(makeCompletionItem("DrawLayer", "DrawLayer=$0 ;替身的渲染层设置，当ZOffset不为0时启用，NONE为自动识别，NONE\\UNDERGROUND\\SURFACE\\GROUND\\AIR\\TOP", "替身的渲染层设置，当ZOffset不为0时启用，NONE为自动识别，NONE\\UNDERGROUND\\SURFACE\\GROUND\\AIR\\TOP", aeStand));
        res.push(makeCompletionItem("ZOffset", "ZOffset=${1:12} ;替身在ZAdjust偏移值，正值在上层，负值在下层，火车类型无效", "替身在ZAdjust偏移值，正值在上层，负值在下层，火车类型无效", aeStand));
        res.push(makeCompletionItem("SameHouse", "SameHouse=${1:yes} ;替身跟随附属对象的所属变化，本体属性变化如心控，替身所属也跟随变化", "替身跟随附属对象的所属变化，本体属性变化如心控，替身所属也跟随变化", aeStand));
        res.push(makeCompletionItem("SameTarget", "SameTarget=${1:yes} ;强制替身与使者攻击同一个目标", "强制替身与使者攻击同一个目标", aeStand));
        res.push(makeCompletionItem("SameLoseTarget", "SameLoseTarget=${1:no} ;使者失去目标同时替身也失去", "使者失去目标同时替身也失去", aeStand));
        res.push(makeCompletionItem("ForceAttackMaster", "ForceAttackMaster=${1:no} ;替身强制选定使者为目标", "替身强制选定使者为目标", aeStand));
        res.push(makeCompletionItem("MobileFire", "MobileFire=${1:yes} ;使者在移动时替身仍可攻击", "使者在移动时替身仍可攻击", aeStand));
        res.push(makeCompletionItem("Powered", "Powered=${1:no} ;替身需要电力支持才能攻击", "替身需要电力支持才能攻击", aeStand));
        res.push(makeCompletionItem("Explodes", "Explodes=${1:no} ;替身死亡时爆炸", "替身死亡时爆炸", aeStand));
        res.push(makeCompletionItem("ExplodesWithMaster", "ExplodesWithMaster=${1:no} ;替身在JOJO死亡时爆炸，覆盖上一条设置", "替身在JOJO死亡时爆炸，覆盖上一条设置", aeStand));
        res.push(makeCompletionItem("RemoveAtSinking", "RemoveAtSinking=${1:no} ;发生沉船时移除", "发生沉船时移除", aeStand));
        res.push(makeCompletionItem("PromoteFormMaster", "PromoteFormMaster=${1:no} ;强制替身等级与使者相同", "强制替身等级与使者相同", aeStand));
        res.push(makeCompletionItem("ExperienceToMaster", "ExperienceToMaster=${1:0.0} ;替身可以训练时，分多少经验给使者，替身不能训练时，击杀100%经验转给使者", "替身可以训练时，分多少经验给使者，替身不能训练时，击杀100%经验转给使者", aeStand));
        res.push(makeCompletionItem("VirtualUnit", "VirtualUnit=${1:no} ;虚拟单位", "虚拟单位", aeStand));
        res.push(makeCompletionItem("SameTilter", "SameTilter=${1:yes} ;替身和使者同为Drive Locomotor时，强制同步替身的倾斜角度。关闭时Drive Loco的替身会自行根据所处的格子倾斜自身。", "替身和使者同为Drive Locomotor时，强制同步替身的倾斜角度。关闭时Drive Loco的替身会自行根据所处的格子倾斜自身。", aeStand));
        res.push(makeCompletionItem("IsTrain", "IsTrain=${1:no} ;火车类型的替身，特殊表现，跟随使者行动轨迹", "火车类型的替身，特殊表现，跟随使者行动轨迹", aeStand));
        res.push(makeCompletionItem("IsCabinHead", "IsCabinHead=${1:no} ;火车类型的替身，在生成时是否插入车厢组前端", "火车类型的替身，在生成时是否插入车厢组前端", aeStand));
        res.push(makeCompletionItem("CabinGroup", "CabinGroup=${1:-1} ;火车类型的替身，车厢的分组", "火车类型的替身，车厢的分组", aeStand));
    }
    if (/^Stand\.Type=/g.test(lineText)) {
        const i = makeCompletionItemFromSection("InfantryTypes");
        res = res.concat(i);
        const v = makeCompletionItemFromSection("VehicleTypes");
        res = res.concat(v);
        const b = makeCompletionItemFromSection("BuildingTypes");
        res = res.concat(b);
    }
    if (/^Stand\.DrawLayer=/g.test(lineText)) {
        res.push(makeCompletionItem("NONE", "NONE", "NONE\\UNDERGROUND\\SURFACE\\GROUND\\AIR\\TOP"));
        res.push(makeCompletionItem("UNDERGROUND", "UNDERGROUND", "NONE\\UNDERGROUND\\SURFACE\\GROUND\\AIR\\TOP"));
        res.push(makeCompletionItem("SURFACE", "SURFACE", "NONE\\UNDERGROUND\\SURFACE\\GROUND\\AIR\\TOP"));
        res.push(makeCompletionItem("GROUND", "GROUND", "NONE\\UNDERGROUND\\SURFACE\\GROUND\\AIR\\TOP"));
        res.push(makeCompletionItem("AIR", "AIR", "NONE\\UNDERGROUND\\SURFACE\\GROUND\\AIR\\TOP"));
        res.push(makeCompletionItem("TOP", "TOP", "NONE\\UNDERGROUND\\SURFACE\\GROUND\\AIR\\TOP"));
    }
    const aeAutoWeapon = [
        "[AttachEffectType]",
        "; 自动武器专属设置",
        "AutoWeapon.WeaponIndex=-1 ;自动发射单位自身的武器序号，0=主武器，1=副武器，优先级高于自定义武器，如果赋予抛射体，此条无效",
        "AutoWeapon.EliteWeaponIndex=-1 ;精英自动发射单位自身的武器序号，不写则是发射上面的武器，0=主武器，1=副武器，优先级高于自定义武器，如果赋予抛射体，此条无效",
        "AutoWeapon.Types=RedEye2,M60 ;自动发射的武器 (原标签 WeaponTypes 更名为 Types)",
        "AutoWeapon.EliteTypes=RedEye2,M60 ;精英自动发射的武器，不写则是发射上面的武器 (原标签 EliteWeaponTypes 更名为 EliteTypes)",
        "AutoWeapon.RandomTypesNum=0 ;随机使用几个武器",
        "AutoWeapon.EliteRandomTypesNum=0 ;精英随机使用几个武器",
        "AutoWeapon.FireOnce=no ;武器在发射一次之后强制结束AE",
        "AutoWeapon.FireFLH=0,0,0 ;发射的FLH",
        "AutoWeapon.EliteFireFLH=0,0,0",
        "AutoWeapon.TargetFLH=0,0,0 ;目标的FLH",
        "AutoWeapon.EliteTargetFLH=0,0,0",
        "AutoWeapon.MoveTo=0,0,0 ;如果设定，覆盖TargetFLH = FireFLH + MoveTo",
        "AutoWeapon.EliteMoveTo=0,0,0",
        "AutoWeapon.FireToTarget=no ;如果设定，朝向附属对象的目标开火，当附属对象没有目标时不开火",
        "AutoWeapon.IsOnTurret=yes ;发射位置和目标位置参考炮塔方向",
        "AutoWeapon.IsOnWorld=no ;发射位置和目标位置以世界坐标做参考，固定朝向北方，不跟随转动",
        "; 攻击者标记专属设置",
        "AutoWeapon.IsAttackerMark=no ;启用时，武器可以朝向攻击者发射或由攻击者朝AE的接受者发射武器",
        "AutoWeapon.ReceiverAttack=yes ;启用时，武器由AE的接受者视IsAttackerMark的值决定朝攻击者或指定坐标点发射，设no则视IsAttackerMark的值决定由攻击者朝AE接受者发射武器，此时武器的所属默认值也变更为攻击者",
        "AutoWeapon.ReceiverOwnBullet=yes ;启用时，武器发射的抛射体所属是AE的接受者，设no则抛射体所属为攻击者"
    ];
    // 自动武器
    if (/^A[utoWeapon]{0,9}$/g.test(lineText)) {
        res.push(makeCompletionItem("AutoWeapon", "AutoWeapon", "AE自动发射武器", aeAutoWeapon));
        res.push(makeCompletionItem("AutoWeapon.WeaponIndex", "AutoWeapon.WeaponIndex=${1:-1} ;自动发射单位自身的武器序号，0=主武器，1=副武器，优先级高于自定义武器，当启用时，如果赋予抛射体，此条无效", "自动发射单位自身的武器序号，0=主武器，1=副武器，优先级高于自定义武器，当启用时，如果赋予抛射体，此条无效", aeAutoWeapon));
        res.push(makeCompletionItem("AutoWeapon.EliteWeaponIndex", "AutoWeapon.EliteWeaponIndex=${1:-1} ;精英自动发射单位自身的武器序号，不写则是发射上面的武器，0=主武器，1=副武器，优先级高于自定义武器，当启用时，如果赋予抛射体，此条无效", "精英自动发射单位自身的武器序号，不写则是发射上面的武器，0=主武器，1=副武器，优先级高于自定义武器，当启用时，如果赋予抛射体，此条无效", aeAutoWeapon));
        res.push(makeCompletionItem("AutoWeapon.Types", "AutoWeapon.Types=$0 ;自动发射的武器类型，可以多个", "自动发射的武器类型，可以多个", aeAutoWeapon));
        res.push(makeCompletionItem("AutoWeapon.EliteTypes", "AutoWeapon.EliteTypes=$0 ;精英自动发射的武器类型，可以多个", "精英自动发射的武器类型，可以多个", aeAutoWeapon));
        res.push(makeCompletionItem("AutoWeapon.RandomTypesNum", "AutoWeapon.RandomTypesNum=${1:0} ;随机使用几个武器", "随机使用几个武器", aeAutoWeapon));
        res.push(makeCompletionItem("AutoWeapon.EliteRandomTypesNum", "AutoWeapon.EliteRandomTypesNum=${1:0} ;精英随机使用几个武器", "精英随机使用几个武器", aeAutoWeapon));
        res.push(makeCompletionItem("AutoWeapon.FireOnce", "AutoWeapon.FireOnce=${1:no} ;武器在发射一次之后强制结束AE", "武器在发射一次之后强制结束AE", aeAutoWeapon));
        res.push(makeCompletionItem("AutoWeapon.FireFLH", "AutoWeapon.FireFLH=${1:0},${2:0},${3:0} ;发射的FLH", "发射的FLH", aeAutoWeapon));
        res.push(makeCompletionItem("AutoWeapon.EliteFireFLH", "AutoWeapon.EliteFireFLH=${1:0},${2:0},${3:0} ;发射的FLH", "发射的FLH", aeAutoWeapon));
        res.push(makeCompletionItem("AutoWeapon.TargetFLH", "AutoWeapon.TargetFLH=${1:0},${2:0},${3:0} ;目标的FLH", "目标的FLH", aeAutoWeapon));
        res.push(makeCompletionItem("AutoWeapon.EliteTargetFLH", "AutoWeapon.EliteTargetFLH=${1:0},${2:0},${3:0} ;目标的FLH", "目标的FLH", aeAutoWeapon));
        res.push(makeCompletionItem("AutoWeapon.MoveTo", "AutoWeapon.MoveTo=${1:0},${2:0},${3:0} ;如果设定，覆盖TargetFLH = FireFLH + MoveTo", "如果设定，覆盖TargetFLH = FireFLH + MoveTo", aeAutoWeapon));
        res.push(makeCompletionItem("AutoWeapon.EliteMoveTo", "AutoWeapon.EliteMoveTo=${1:0},${2:0},${3:0} ;如果设定，覆盖TargetFLH = FireFLH + MoveTo", "如果设定，覆盖TargetFLH = FireFLH + MoveTo", aeAutoWeapon));
        res.push(makeCompletionItem("AutoWeapon.FireToTarget", "AutoWeapon.FireToTarget=${1:no} ;如果设定，朝向附属对象的目标开火，当附属对象没有目标时不开火", "如果设定，朝向附属对象的目标开火，当附属对象没有目标时不开火", aeAutoWeapon));
        res.push(makeCompletionItem("AutoWeapon.IsOnTurret", "AutoWeapon.IsOnTurret=${1:yes} ;发射位置和目标位置参考炮塔方向", "发射位置和目标位置参考炮塔方向", aeAutoWeapon));
        res.push(makeCompletionItem("AutoWeapon.IsOnWorld", "AutoWeapon.IsOnWorld=${1:no} ;发射位置和目标位置以世界坐标做参考，固定朝向北方，不跟随转动", "发射位置和目标位置以世界坐标做参考，固定朝向北方，不跟随转动", aeAutoWeapon));
        //攻击者标记专属设置
        res.push(makeCompletionItem("AutoWeapon.IsAttackerMark", "AutoWeapon.IsAttackerMark=${1:no} ;启用时，武器可以朝向攻击者发射或由攻击者朝AE的接受者发射武器", "启用时，武器可以朝向攻击者发射或由攻击者朝AE的接受者发射武器", aeAutoWeapon));
        res.push(makeCompletionItem("AutoWeapon.ReceiverAttack", "AutoWeapon.ReceiverAttack=${1:yes} ;启用时，武器由AE的接受者视IsAttackerMark的值决定朝攻击者或指定坐标点发射，设no则视IsAttackerMark的值决定由攻击者朝AE接受者发射武器，此时武器的所属默认值也变更为攻击者", "启用时，武器由AE的接受者视IsAttackerMark的值决定朝攻击者或指定坐标点发射，设no则视IsAttackerMark的值决定由攻击者朝AE接受者发射武器，此时武器的所属默认值也变更为攻击者", aeAutoWeapon));
        res.push(makeCompletionItem("AutoWeapon.ReceiverOwnBullet", "AutoWeapon.ReceiverOwnBullet=${1:yes} ;启用时，武器发射的抛射体所属是AE的接受者，设no则抛射体所属为攻击者", "启用时，武器发射的抛射体所属是AE的接受者，设no则抛射体所属为攻击者", aeAutoWeapon));
    }
    if (/^AutoWeapon\.(.(?!\=))*$/g.test(lineText)) {
        res.push(makeCompletionItem("WeaponIndex", "WeaponIndex=${1:-1} ;自动发射单位自身的武器序号，0=主武器，1=副武器，优先级高于自定义武器，当启用时，Mark.ReceiverOwnBullet的设置无效，如果赋予抛射体，此条无效", "自动发射单位自身的武器序号，0=主武器，1=副武器，优先级高于自定义武器，当启用时，Mark.ReceiverOwnBullet的设置无效，如果赋予抛射体，此条无效", aeAutoWeapon));
        res.push(makeCompletionItem("EliteWeaponIndex", "EliteWeaponIndex=${1:-1} ;精英自动发射单位自身的武器序号，不写则是发射上面的武器，0=主武器，1=副武器，优先级高于自定义武器，当启用时，Mark.ReceiverOwnBullet的设置无效，如果赋予抛射体，此条无效", "精英自动发射单位自身的武器序号，不写则是发射上面的武器，0=主武器，1=副武器，优先级高于自定义武器，当启用时，Mark.ReceiverOwnBullet的设置无效，如果赋予抛射体，此条无效", aeAutoWeapon));
        res.push(makeCompletionItem("Types", "Types=$0 ;自动发射的武器类型，可以多个", "自动发射的武器类型，可以多个", aeAutoWeapon));
        res.push(makeCompletionItem("EliteTypes", "EliteTypes=$0 ;精英自动发射的武器类型，可以多个", "精英自动发射的武器类型，可以多个", aeAutoWeapon));
        res.push(makeCompletionItem("RandomTypesNum", "RandomTypesNum=${1:0} ;随机使用几个武器", "随机使用几个武器", aeAutoWeapon));
        res.push(makeCompletionItem("EliteRandomTypesNum", "EliteRandomTypesNum=${1:0} ;精英随机使用几个武器", "精英随机使用几个武器", aeAutoWeapon));
        res.push(makeCompletionItem("FireOnce", "FireOnce=${1:no} ;武器在发射一次之后强制结束AE", "武器在发射一次之后强制结束AE", aeAutoWeapon));
        res.push(makeCompletionItem("FireFLH", "FireFLH=${1:0},${2:0},${3:0} ;发射的FLH", "发射的FLH", aeAutoWeapon));
        res.push(makeCompletionItem("EliteFireFLH", "EliteFireFLH=${1:0},${2:0},${3:0} ;发射的FLH", "发射的FLH", aeAutoWeapon));
        res.push(makeCompletionItem("TargetFLH", "TargetFLH=${1:0},${2:0},${3:0} ;目标的FLH", "目标的FLH", aeAutoWeapon));
        res.push(makeCompletionItem("EliteTargetFLH", "EliteTargetFLH=${1:0},${2:0},${3:0} ;目标的FLH", "目标的FLH", aeAutoWeapon));
        res.push(makeCompletionItem("MoveTo", "MoveTo=${1:0},${2:0},${3:0} ;如果设定，覆盖TargetFLH = FireFLH + MoveTo", "如果设定，覆盖TargetFLH = FireFLH + MoveTo", aeAutoWeapon));
        res.push(makeCompletionItem("EliteMoveTo", "EliteMoveTo=${1:0},${2:0},${3:0} ;如果设定，覆盖TargetFLH = FireFLH + MoveTo", "如果设定，覆盖TargetFLH = FireFLH + MoveTo", aeAutoWeapon));
        res.push(makeCompletionItem("FireToTarget", "FireToTarget=${1:no} ;如果设定，朝向附属对象的目标开火，当附属对象没有目标时不开火", "如果设定，朝向附属对象的目标开火，当附属对象没有目标时不开火", aeAutoWeapon));
        res.push(makeCompletionItem("IsOnTurret", "IsOnTurret=${1:yes} ;发射位置和目标位置参考炮塔方向", "发射位置和目标位置参考炮塔方向", aeAutoWeapon));
        res.push(makeCompletionItem("IsOnWorld", "IsOnWorld=${1:no} ;发射位置和目标位置以世界坐标做参考，固定朝向北方，不跟随转动", "发射位置和目标位置以世界坐标做参考，固定朝向北方，不跟随转动", aeAutoWeapon));
        //攻击者标记专属设置
        res.push(makeCompletionItem("IsAttackerMark", "IsAttackerMark=${1:no} ;启用时，武器可以朝向攻击者发射或由攻击者朝AE的接受者发射武器", "启用时，武器可以朝向攻击者发射或由攻击者朝AE的接受者发射武器", aeAutoWeapon));
        res.push(makeCompletionItem("ReceiverAttack", "ReceiverAttack=${1:yes} ;启用时，武器由AE的接受者视IsAttackerMark的值决定朝攻击者或指定坐标点发射，设no则视IsAttackerMark的值决定由攻击者朝AE接受者发射武器，此时武器的所属默认值也变更为攻击者", "启用时，武器由AE的接受者视IsAttackerMark的值决定朝攻击者或指定坐标点发射，设no则视IsAttackerMark的值决定由攻击者朝AE接受者发射武器，此时武器的所属默认值也变更为攻击者", aeAutoWeapon));
        res.push(makeCompletionItem("ReceiverOwnBullet", "ReceiverOwnBullet=${1:yes} ;启用时，武器发射的抛射体所属是AE的接受者，设no则抛射体所属为攻击者", "启用时，武器发射的抛射体所属是AE的接受者，设no则抛射体所属为攻击者", aeAutoWeapon));
    }
    if (/(^AutoWeapon\.Types=)|(^AutoWeapon\.EliteTypes=)/g.test(lineText)) {
        const i = makeCompletionItemFromSection("WeaponTypes");
        res = res.concat(i);
    }
    const aePaint = [
        "[AttachEffectType]",
        "; 彩弹专属设置",
        "Paintball.Color=255,255,255 ;RGB888，需要大于128才会显色，比如：金色=（180,170,0）",
        "Paintball.IsHouseColor=no ;默认使用弹头的所属色，当OwnerTarget=yes时使用附加单位的所属色"
    ];
    // 彩弹
    if (/^P[aintball]{0,8}$/g.test(lineText)) {
        res.push(makeCompletionItem("Paintball", "Paintball", "AE染色", aePaint));
        res.push(makeCompletionItem("Paintball.Color", "Paintball.Color=${1:255},${2:255},${3:255} ;RGB888，需要大于128才会显色，比如：金色=（180,170,0）", "RGB888，需要大于128才会显色，比如：金色=（180,170,0）", aePaint));
        res.push(makeCompletionItem("Paintball.IsHouseColor", "Paintball.IsHouseColor=${1:no} ;默认使用弹头的所属色，当OwnerTarget=yes时使用附加单位的所属色", "默认使用弹头的所属色，当OwnerTarget=yes时使用附加单位的所属色", aePaint));
    }
    if (/^Paintball\./g.test(lineText)) {
        res.push(makeCompletionItem("Color", "Color=${1:255},${2:255},${3:255} ;RGB888，需要大于128才会显色，比如：金色=（180,170,0）", "RGB888，需要大于128才会显色，比如：金色=（180,170,0）", aePaint));
        res.push(makeCompletionItem("IsHouseColor", "IsHouseColor=${1:no} ;默认使用弹头的所属色，当OwnerTarget=yes时使用附加单位的所属色", "默认使用弹头的所属色，当OwnerTarget=yes时使用附加单位的所属色", aePaint));
    }
    const aeTrans = [
        "[AttachEffectType]",
        "; 变形专属设置",
        "Transform.Type=none ;变形的目标，只能同类之间转换"
    ];
    // 变形
    if (/^T[ransform]{0,8}$/g.test(lineText)) {
        res.push(makeCompletionItem("Transform", "Transform", "AE变形", aeTrans));
        res.push(makeCompletionItem("Transform.Type", "Transform.Type=$0 ;变形的目标，只能同类之间转换", "变形的目标，只能同类之间转换", aeTrans));
    }
    if (/^Transform\.(.(?!\=))*$/g.test(lineText)) {
        res.push(makeCompletionItem("Type", "Transform.Type=$0 ;变形的目标，只能同类之间转换", "变形的目标，只能同类之间转换", aeTrans));
    }
    if (/^Transform\.Type=/g.test(lineText)) {
        const i = makeCompletionItemFromSection("InfantryTypes");
        res = res.concat(i);
        const v = makeCompletionItemFromSection("VehicleTypes");
        res = res.concat(v);
        const b = makeCompletionItemFromSection("BuildingTypes");
        res = res.concat(b);
    }
    const aeBlackHole = [
        "[AttachEffectType]",
        "; 黑洞专属设置",
        "BlackHole.Range=0 ;扫描抛射体的范围，单位格，大于0时启用该功能",
        "BlackHole.EliteRange=0 ;精英级扫描抛射体的范围，单位格",
        "BlackHole.Rate=15 ;扫描的频率，间隔多少帧扫描一次，越大越慢",
        "BlackHole.EliteRate=15 ;精英级扫描的频率，间隔多少帧扫描一次，越大越慢",
        "; 黑洞影响过滤器专属设置",
        "BlackHole.AffectTypes=none ;类型过滤，可影响的单位，如果设置，则只可以影响列表中的单位",
        "BlackHole.NotAffectTypes=none ;类型过滤，不可影响的单位，如果设置，则列表中的单位不被吸引，优先级更高",
        // "; BlackHole.AffectTechno=no ;类型过滤，影响范围内的单位 (注意Affect没有s)",
        // "; BlackHole.OnlyAffectTechno=no ;类型过滤，只影响单位，不影响抛射体 (注意Affect没有s)",
        "BlackHole.AffectMissile=yes ;类型过滤，影响ROT>0的抛射体",
        "BlackHole.AffectTorpedo=yes ;类型过滤，影响Level=yes的抛射体",
        // "; BlackHole.AffectCannon=no ;类型过滤，影响Arcing=yes的抛射体",
        "; 黑洞敌我识别专属设置",
        "BlackHole.AffectsOwner=no ;敌我识别，影响发射者同阵营（注意Affects有s）",
        "BlackHole.AffectsAllies=no ;敌我识别，影响友军（注意Affects有s）",
        "BlackHole.AffectsEnemies=yes ;敌我识别，影响敌人（注意Affects有s）"
    ];
    // 黑洞
    if (/^B[lackHole]{0,8}$/g.test(lineText)) {
        res.push(makeCompletionItem("BlackHole", "BlackHole", "AE黑洞", aeBlackHole));
        res.push(makeCompletionItem("BlackHole.Range", "BlackHole.Range=${1:0} ;扫描抛射体的范围，单位格，大于0时启用该功能", "扫描抛射体的范围，单位格，大于0时启用该功能", aeBlackHole));
        res.push(makeCompletionItem("BlackHole.EliteRange", "BlackHole.EliteRange=${1:0} ;精英级扫描抛射体的范围，单位格", "精英级扫描抛射体的范围，单位格", aeBlackHole));
        res.push(makeCompletionItem("BlackHole.Rate", "BlackHole.Rate=${1:15} ;扫描的频率，间隔多少帧扫描一次，越大越慢", "扫描的频率，间隔多少帧扫描一次，越大越慢", aeBlackHole));
        res.push(makeCompletionItem("BlackHole.EliteRate", "BlackHole.EliteRate=${1:15} ;精英级扫描的频率，间隔多少帧扫描一次，越大越慢", "精英级扫描的频率，间隔多少帧扫描一次，越大越慢", aeBlackHole));
        //黑洞影响过滤器专属设置
        res.push(makeCompletionItem("BlackHole.AffectTypes", "BlackHole.AffectTypes=$0 ;类型过滤，可影响的单位，如果设置，则只可以影响列表中的单位", "类型过滤，可影响的单位，如果设置，则只可以影响列表中的单位", aeBlackHole));
        res.push(makeCompletionItem("BlackHole.NotAffectTypes", "BlackHole.NotAffectTypes=$0 ;类型过滤，不可影响的单位，如果设置，则列表中的单位不被吸引，优先级更高", "类型过滤，不可影响的单位，如果设置，则列表中的单位不被吸引，优先级更高", aeBlackHole));
        //BlackHole.AffectTechno=no ;类型过滤，影响范围内的单位 (注意Affect没有s)
        //BlackHole.OnlyAffectTechno=no ;类型过滤，只影响单位，不影响抛射体 (注意Affect没有s)
        res.push(makeCompletionItem("BlackHole.AffectMissile", "BlackHole.AffectMissile=${1:yes} ;类型过滤，影响ROT>0的抛射体", "类型过滤，影响ROT>0的抛射体", aeBlackHole));
        res.push(makeCompletionItem("BlackHole.AffectTorpedo", "BlackHole.AffectTorpedo=${1:yes} ;类型过滤，影响Level=yes的抛射体", "类型过滤，影响Level=yes的抛射体", aeBlackHole));
        //BlackHole.AffectCannon=no ;类型过滤，影响Arcing=yes的抛射体
        //黑洞敌我识别专属设置
        res.push(makeCompletionItem("BlackHole.AffectsOwner", "BlackHole.AffectsOwner=${1:no} ;敌我识别，影响发射者同阵营（注意Affects有s）", "敌我识别，影响发射者同阵营（注意Affects有s）", aeBlackHole));
        res.push(makeCompletionItem("BlackHole.AffectsAllies", "BlackHole.AffectsAllies=${1:no} ;敌我识别，影响友军（注意Affects有s）", "敌我识别，影响友军（注意Affects有s）", aeBlackHole));
        res.push(makeCompletionItem("BlackHole.AffectsEnemies", "BlackHole.AffectsEnemies=${1:yes} ;敌我识别，影响敌人（注意Affects有s）", "敌我识别，影响敌人（注意Affects有s）", aeBlackHole));
    }
    if (/^BlackHole\.(.(?!\=))*$/g.test(lineText)) {
        res.push(makeCompletionItem("Range", "Range=${1:0} ;扫描抛射体的范围，单位格，大于0时启用该功能", "扫描抛射体的范围，单位格，大于0时启用该功能", aeBlackHole));
        res.push(makeCompletionItem("EliteRange", "EliteRange=${1:0} ;精英级扫描抛射体的范围，单位格", "精英级扫描抛射体的范围，单位格", aeBlackHole));
        res.push(makeCompletionItem("Rate", "Rate=${1:15} ;扫描的频率，间隔多少帧扫描一次，越大越慢", "扫描的频率，间隔多少帧扫描一次，越大越慢", aeBlackHole));
        res.push(makeCompletionItem("EliteRate", "EliteRate=${1:15} ;精英级扫描的频率，间隔多少帧扫描一次，越大越慢", "精英级扫描的频率，间隔多少帧扫描一次，越大越慢", aeBlackHole));
        //黑洞影响过滤器专属设置
        res.push(makeCompletionItem("AffectTypes", "AffectTypes=$0 ;类型过滤，可影响的单位，如果设置，则只可以影响列表中的单位", "类型过滤，可影响的单位，如果设置，则只可以影响列表中的单位", aeBlackHole));
        res.push(makeCompletionItem("NotAffectTypes", "NotAffectTypes=$0 ;类型过滤，不可影响的单位，如果设置，则列表中的单位不被吸引，优先级更高", "类型过滤，不可影响的单位，如果设置，则列表中的单位不被吸引，优先级更高", aeBlackHole));
        //AffectTechno=no ;类型过滤，影响范围内的单位 (注意Affect没有s)
        //OnlyAffectTechno=no ;类型过滤，只影响单位，不影响抛射体 (注意Affect没有s)
        res.push(makeCompletionItem("AffectMissile", "AffectMissile=${1:yes} ;类型过滤，影响ROT>0的抛射体", "类型过滤，影响ROT>0的抛射体", aeBlackHole));
        res.push(makeCompletionItem("AffectTorpedo", "AffectTorpedo=${1:yes} ;类型过滤，影响Level=yes的抛射体", "类型过滤，影响Level=yes的抛射体", aeBlackHole));
        //AffectCannon=no ;类型过滤，影响Arcing=yes的抛射体
        //黑洞敌我识别专属设置
        res.push(makeCompletionItem("AffectsOwner", "AffectsOwner=${1:no} ;敌我识别，影响发射者同阵营（注意Affects有s）", "敌我识别，影响发射者同阵营（注意Affects有s）", aeBlackHole));
        res.push(makeCompletionItem("AffectsAllies", "AffectsAllies=${1:no} ;敌我识别，影响友军（注意Affects有s）", "敌我识别，影响友军（注意Affects有s）", aeBlackHole));
        res.push(makeCompletionItem("AffectsEnemies", "AffectsEnemies=${1:yes} ;敌我识别，影响敌人（注意Affects有s）", "敌我识别，影响敌人（注意Affects有s）", aeBlackHole));
    }
    if (/(^BlackHole\.AffectTypes=)|(^BlackHole\.NotAffectTypes=)/g.test(lineText)) {
        const i = makeCompletionItemFromSection("InfantryTypes");
        res = res.concat(i);
        const v = makeCompletionItemFromSection("VehicleTypes");
        res = res.concat(v);
        const b = makeCompletionItemFromSection("BuildingTypes");
        res = res.concat(b);
    }




    return res;


}

/**
 * 光标选中当前自动补全item时触发动作，一般情况下无需处理
 * @param {*} item 
 * @param {*} token 
 */
// @ts-ignore
function resolveCompletionItem(item, token) {
    return null;
}


module.exports = {
    activate,
    deactivate
}

