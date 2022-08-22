var timer;

$("#searchBox").keydown((event) => {
    clearTimeout(timer);
    var textbox = $(event.target);
    var value = textbox.val();
    var searchType = textbox.data().search;

    // Executes the code inside this function after 1 second
    timer = setTimeout(() => {
        value = textbox.val().trim();

        if(value == "") {
            $(".resultsContainer").html("");
        }
        else {
            search(value, searchType);
        }
    }, 2000)

})

function search(searchTerm, searchType) {
    var url = searchType == "users" ? "/api/users" : "/api/posts"

     // Ajax call 
     $.get(url, { search: searchTerm }, (results) => {
        if(searchType == "users") {
            outputUsers(results, $(".resultsContainer"));
        }
        else {
            outputPosts(results, $(".resultsContainer"))
        }
    })
}