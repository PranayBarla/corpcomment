//----Global-----
const textareaEl = document.querySelector('.form__textarea');
const counterEl = document.querySelector('.counter');
const formEl = document.querySelector('.form');
const feedbackListEl = document.querySelector('.feedbacks');
const submitButtonEl = document.querySelector('.submit-btn');
const spinnerEl = document.querySelector('.spinner');
const hashtagListEl = document.querySelector('.hashtags');


const BASE_API_URL = 'https://bytegrad.com/course-assets/js/1/api';

const MAX_CHARS = 150;

const renderFeedbackItems = (feedbackItem)=>{
    const feedbackItemHTML = `
        <li class="feedback">
            <button class="upvote">
                <i class="fa-solid fa-caret-up upvote__icon"></i>
                <span class="upvote__count">${feedbackItem.upvoteCount}</span>
            </button>
            <section class="feedback__badge">
                <p class="feedback__letter">${feedbackItem.badgeLetter}</p>
            </section>
            <div class="feedback__content">
                <p class="feedback__company">${feedbackItem.company}</p>
                <p class="feedback__text">${feedbackItem.text}</p>
            </div>
            <p class="feedback__date">${feedbackItem.daysAgo === 0 ? 'New':`${feedbackItem.daysAgo}d`}</p>
        </li>
    `;
    feedbackListEl.insertAdjacentHTML('beforeend',feedbackItemHTML);
}


//---COUNTER_COMPONENT----
const inputHandler = ()=>{
    const maxNum = MAX_CHARS;
    const charTyped = textareaEl.value.length;
    const charLeft = maxNum-charTyped;
    counterEl.textContent = charLeft;
}
textareaEl.addEventListener('input',inputHandler);

//---FORM-COMPONENT---

    //Red or Green line func
const showVisualIndicator = validityChecker =>{
    const className = validityChecker === 'valid' ? 'form--valid':'form--invalid'; 
    formEl.classList.add(className);
    setTimeout(()=>{
    formEl.classList.remove(className);
    },2000);
};

const submitHandler = event=>{
    event.preventDefault();
    const text = textareaEl.value;
    //---Check for #-------
    if(text.includes('#') && text.length>=4){
        showVisualIndicator('valid');
    }
    else{
        showVisualIndicator('invalid');
        textareaEl.focus();
        return;
    }

    //extracting #tag company-name badge-letter
    const hashtag = text.split(' ').find(present => present.includes('#'));
    const company = hashtag.substring(1);
    const badgeLetter = company.substring(0,1).toUpperCase();
    const upvoteCount = 0;
    const daysAgo = 0;
    const feedbackItem = {
        upvoteCount: upvoteCount,
        company: company,
        badgeLetter: badgeLetter,
        daysAgo: daysAgo,
        text: text
    }

//render--feedback--items
    renderFeedbackItems(feedbackItem);

//--send--items--to--the--server
    fetch(`${BASE_API_URL}/feedbacks`,{
        method:'POST',
        body: JSON.stringify(feedbackItem),
        headers:{
            Accept:'application/json',
            'Content-type':'application/json'

        }
    }).then(responce => {
        if(!responce.ok){
            console.log('Something went wrong!');
            return;
        }
        console.log('Successfully Submitted');
        
    }).catch(err => console.log(err));

    
//-------Reset--Text_Area----and---Button
    textareaEl.value = '';
    submitButtonEl.blur();
    counterEl.textContent = MAX_CHARS;
}
formEl.addEventListener('submit',submitHandler);


//--Feedback--list--components
const clickHandler = event =>{
    const clickedEl = event.target;
    const upvoteIntention = clickedEl.className.includes('upvote');
    
    if(upvoteIntention){
        const upvoteBtnEl = clickedEl.closest('.upvote');
        //disable--spam||double--click
        upvoteBtnEl.disabled = true;
        //upvote--functionality
        const upvoteCountEl = upvoteBtnEl.querySelector('.upvote__count');
        let upvoteCounter = +upvoteCountEl.textContent;
        upvoteCountEl.textContent = ++upvoteCounter;

    }else{
        clickedEl.closest('.feedback').classList.toggle('feedback--expand');
        //feedbackListEl.addEventListener('mouseout',(event)=>clickedEl.closest('.feedback').classList.remove('feedback--expand'))
        // setTimeout(()=>clickedEl.closest('.feedback').classList.remove('feedback--expand'),4000)
    }
}

feedbackListEl.addEventListener('click',clickHandler);

//get--response--from--server
fetch(`${BASE_API_URL}/feedbacks`)
    .then(res => res.json())
    .then(data =>{
        //--remove--loading--spinner--after--data--loads
        spinnerEl.remove();
        data.feedbacks.forEach(feedbackElements => renderFeedbackItems(feedbackElements));
})
    .catch((err)=>feedbackListEl.textContent = `Error Message: ${err.message}`)
;


//Hashtag--list--components

const clickHandler2 = event =>{
    const clickedEl = event.target;
    if(clickedEl === 'hashtags') return;
    const companyNameFromHastag = clickedEl.textContent.substring(1).toLowerCase().trim();
    feedbackListEl.childNodes.forEach(childNode => {
        if (childNode.nodeType === 3) return;

        const companyNameFromFeedbackItem = childNode.querySelector('.feedback__company').textContent.toLowerCase().trim();

        if(companyNameFromHastag !== companyNameFromFeedbackItem){
            childNode.remove();
        }
    })

}

hashtagListEl.addEventListener('click',clickHandler2);

