function incrementViews(types) {

  Parse.Cloud.run('incrementViews', {
    name: document.title,
    types
  }).then((res) => {

    getViewsAndComments();

  });

}


function getViewsAndComments() {
  return new Promise(resolve => {

    Parse.Cloud.run('getViewsAndComments', {
      name: document.title
    }).then((res) => {

      document.getElementById('allViews').innerHTML =
        '<p>All Views: ' + res.allViews + '</p>';
      document.getElementById('uniqueViews').innerHTML =
        '<p>Unique Views: ' + res.uniqueViews + '</p>';
      document.getElementById('botViews').innerHTML =
        '<p>Bot Views: ' + res.botViews + '</p>';


      const comments = document.getElementById('comments');

      if (res.comments.length === 0) {
        comments.innerHTML =
          '<p class="faded">There are currently no comments.</p>';
      } else {
        comments.innerHTML = res.comments.reverse()
        .reduce((acc, value) => {
          return acc + '<div class="comment"><b>' + value.name + '</b><p>'
            + value.comment + '</p><small>' + value.time +
            '</small></div>';
        }, '');
      }

      resolve();
    });

  });
}



document.getElementById('submitComment').addEventListener('click', () => {

  const username = document.getElementById('name').value;
  const comment = document.getElementById('comment').value;

  if (username.trim() === '' || comment.trim() === '') {
    document.getElementById('addCommentError').innerText =
      'Both fields are required';

    return false;
  }

  document.getElementById('addCommentError').innerText = '';

  Parse.Cloud.run('addComment', {
    name: document.title,
    username,
    comment
  }).then((res) => {

    document.getElementById('comment').value = '';

    const comments = document.getElementById('comments');

    if (comments.innerHTML ===
      '<p class="faded">There are currently no comments.</p>') {

      comments.innerHTML =
        '<div class="comment"><b>' + username + '</b><p>' + comment +
        '</p><small>' + res.time + '</small></div>';

    } else {

      comments.innerHTML =
        '<div class="comment"><b>' + username + '</b><p>' + comment +
        '</p><small>' + res.time + '</small></div>'
        + comments.innerHTML;

    }
  });

});


const refresh = document.getElementById('refresh');

refresh.addEventListener('click', () => {

  refresh.innerHTML =
    '<span class="fas fa-sync-alt fa-spin"></span> Refreshing';

  getViewsAndComments().then(() => {

    refresh.innerHTML =
      '<span class="fas fa-sync-alt"></span> Refresh';
    
  });
});



Parse.initialize('55LsP3jDMhMzJ5k9J3wqpZ8ebMUrGkcgaj17Pfgz',
  'AjXQYFg6wIhUMunRYpGvoRdNsliOZxRYMFG6FsX7');
Parse.serverURL = 'https://parseapi.back4app.com/';



if (/bot|crawl|spider/i.test(navigator.userAgent)) {
  incrementViews(['all', 'bot']);
} else if (localStorage.getItem('Post "' + document.title + '" viewed')) {
  incrementViews(['all']);
} else {
  localStorage.setItem('Post "' + document.title + '" viewed', true);
  incrementViews(['all', 'unique']);
}