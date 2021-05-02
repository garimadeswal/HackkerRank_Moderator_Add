// npm install puppeteer  
let fs=require('fs');
let pp=require('puppeteer');

let cfile=process.argv[2];
let userAdd=process.argv[3];

(async function(){

   try{
    const browser= await pp.launch({

        headless:false, 
        defaultViewport:null,
        slowMo : 10,
        args: ['--start-mazimized','--default-notifications']
        
    });

    let contents= await fs.promises.readFile(cfile , 'utf-8');
    let obj=JSON.parse(contents);
    let user=obj.user;
    let pwd =obj.pwd;
    let url=obj.url;

    let pages= await browser.pages();
    let page=pages[0];

    page.goto(url , {
        waitUntil:'networkidle0'
    });                                     //0  means request 0 nhi ho jati tab tak wait krro .. 1 means 1 request 
    await page.waitForSelector('.auth-button' ,{
        visible: true
    });

    await page.type('#input-1',user);
    await page.type('#input-2',pwd);
    await page.click(".auth-button");
    await page.waitForNavigation({waitUntil:'networkidle0'});
    await page.waitForSelector('.profile-menu .ui-icon-chevron-down.down-icon' ,{
        visible: true
    });

    // await  page.click('.profile-menu .ui-icon-chevron-down.down-icon');
    // await page.click("a[data-analytics=NavBarProfileDropDownAdministration]");
    // await page.waitForNavigation({waitUntil: 'networkidle0'});      
    // //data aana band na ho jaye mtlb pichle 5milisec me 0 request aai h.. to mtlb page load ho chuka h 
    // await page.waitForSelector('ul.nav-tabs' ,{
    //     visible: true
    // });


//     let manageIs =await page.$$('ul.nav-tabs li')
//     // $ give 1 li 
//     // $$ gives array of li
//     await manageIs[1].click();
//     let cururl=page.url();

//     let qid=0;
//     let quesElemeent=await getQuesElement(cururl , qid , page);
//     while(quesElemeent!==undefined){
//         await handleQues(quesElemeent, page);
//         qid++;
//         console.log("main");
//         quesElemeent=await getQuesElement(cururl,qid , page);
//     }
}

    catch(err)
    {
        console.log(err);
    }

})();

async function getQuesElement(cururl , qid , page)
{
    await page.goto(cururl , {waitUntil:'networkidle0'});
    await page.waitForNavigation('ul.nav-tabs' ,{
        visible: true
    });

    
    let pid = parseInt(qid / 10);
    qid = qid % 10;
    console.log(pid + " " + qid);

    let paginationBtns = await page.$$('.pagination li');
    let nextPageBtn = paginationBtns[paginationBtns.length - 2];
    
    let classOnNextPageBtn = await page.evaluate(function (el){
        return el.getAttribute("class");
    } , nextPageBtn);


    for (let i = 0; i < pid; i++) {
        if (classOnNextPageBtn !== 'disabled') {
            await nextPageBtn.click();
            await page.waitForSelector('.pagination li',{
                visible:true
            })


            paginationBtns = await page.$$('.pagination li');

            nextPageBtn = paginationBtns[paginationBtns.length - 2];
            classOnNextPageBtn = await page.evaluate(function (el){
                return el.getAttribute("class");
            } , nextPageBtn);

        } else {
            return undefined;
        }
    }
    let quesElemeent=await page.$$('.backbone.block-center');
    if(qid<quesElemeent.length)
        return quesElemeent[qid];
    else 
        return undefined;


}

async function handleQues(quesElemeent ,page)
{
    let qurl = await quesElemeent.getAttribute('href');
    console.log(qurl);
    await quesElemeent.click();
    await page.waitForNavigation({waitUntil:'networkidle0'});

    await page.waitForSelector('span.tag' ,{
        visible: true
    });

    await page.click('li[data-tab=moderators]');
    await page.waitForSelector('#moderator' ,{
        visible: true
    });

    await page.type('#moderator' , userAdd);
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ENTER");
    await page.click('.save-challenge');

}
