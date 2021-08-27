/* eslint no-console: ["error", { allow: ["warn", "error"] }] */
let pokemonRepository = (function () {
  let pokemonList = [];
  const apiUrl = "https://pokeapi.co/api/v2/pokemon/?limit=150";

  //add adds the pokemon passed as argument to the end of the pokemonList
  function add(pokemon) {
    if (typeof pokemon === "object" && "name" in pokemon) {
      pokemonList.push(pokemon);
    } else {
      console.error(`Sorry bro, that's not a valid pokemon 👎: ${pokemon}`);
    }
  }

  //getAll returns the pokemonList array
  function getAll() {
    return pokemonList;
  }

  //addListItem adds a list item to the list passed as second argument
  //The list item will contain a button which text is the pokemon name passed as first argument
  function addListItem(pokemon) {
    //select the list to populate
    const pokemonCollection = $(".pokemon-list");
    //create a list item
    let listItem = $("<li></li>");
    listItem.addClass("list-group-item");
    listItem.attr("data-search-term", pokemon.name.toLowerCase());
    //create a button
    let button = $(
      `<button 
        class="pokemon-button btn glow-on-hover"
        type="button"
        data-toggle="modal"
        data-target="#modal-container"
      >${pokemon.name}</button>`
    );

    //append the button to the list item
    listItem.append(button);
    //append the list item to the list
    pokemonCollection.append(listItem);
    //add eventlistener to button
    showOnClick(button, pokemon);
  }

  //loadList fetches the list of pokemons from the API url
  function loadList() {
    showLoadingMessage();
    return fetch(apiUrl)
      .then(function (response) {
        hideLoadingMessage();
        return response.json();
      })
      .then(function (json) {
        json.results.forEach(function (item) {
          let pokemon = {
            //saving the pokemon name with an uppercase letter
            name: item.name.charAt(0).toUpperCase() + item.name.slice(1),
            detailsUrl: item.url,
          };

          add(pokemon);
        });
      })
      .catch(function (e) {
        hideLoadingMessage();
        console.error(e);
      });
  }

  //loadDetails fetches the list of details from the detailsUrl associated with each pokemon
  //This function is called after clicking on the pokemon we want to know the details of.
  function loadDetails(item) {
    showLoadingMessage();
    let url = item.detailsUrl;
    let name = item.name;
    return fetch(url)
      .then(function (response) {
        hideLoadingMessage();
        return response.json();
      })
      .then(function (details) {
        item.name = name;
        item.imageUrl = details.sprites.front_default;
        item.height = details.height / 10; //meters
        item.weight = details.weight / 10; //kg
        item.types = details.types;
        item.abilities = details.abilities;
        item.artworkUrl = details.sprites.other.dream_world.front_default;
      })
      .catch(function (e) {
        hideLoadingMessage();
        console.error(e);
      });
  }

  //showDetails loads the details of the pokemon passed as argument
  //Once loaded, the pokemon object is used to populate the modal fields
  function showDetails(pokemonToShow) {
    pokemonRepository.loadDetails(pokemonToShow).then(function () {
      populateModal(pokemonToShow);
    });
  }

  function showLoadingMessage() {
    const loadingMessageArea = $(".loading-message-area");
    if (loadingMessageArea.hasClass("hide")) {
      loadingMessageArea.removeClass("hide");
      let message = $('<p class="loading-msg"></p>');
      message.text("Please wait, gotta fetch 'em all ...");
      $(".loading-message-wrapper").append(message);
    }
  }

  function hideLoadingMessage() {
    const loadingMessageArea = $(".loading-message-area");
    if (!loadingMessageArea.hasClass("hide")) {
      loadingMessageArea.addClass("hide");
      //remove the message
      $(".loading-message-wrapper").empty();
    }
  }

  //populateModal used the pokemon object passed as argument to populate the content of
  //the modal that pops up after clicking on a pokemon from the pokemon repository
  function populateModal(pokemonToShow) {
    //populating name
    let pokemonName = $("#pokemon-title");
    pokemonName.text(pokemonToShow.name);

    let pokemonTypes = $(".type-list");
    //remove previous types if any
    pokemonTypes.text("");
    //populating types
    pokemonToShow.types.forEach((type) => {
      let listItem = $(`<li>${type.type.name}</li>`);
      pokemonTypes.append(listItem);
    });

    //populating img
    let pokemonImage = $(".pokemon-img");
    pokemonImage.attr("src", pokemonToShow.artworkUrl);
    pokemonImage.attr(
      "alt",
      `Official artwork representing ${pokemonToShow.name}`
    );

    //populating height and weight
    let pokemonHeight = $(".pokemon-height");
    let pokemonWeight = $(".pokemon-weight");
    pokemonHeight.text(pokemonToShow.height);
    pokemonWeight.text(pokemonToShow.weight);

    //populating abilities
    let abilityList = $(".ability-list");
    abilityList.html("");

    pokemonToShow.abilities.forEach((ability) => {
      let abilityItem = $(`<li>${ability.ability.name}</li>`);
      abilityList.append(abilityItem);
    });
  }

  function showOnClick(button, pokemon) {
    button.on("click", function () {
      showDetails(pokemon);
    });
  }

  return {
    getAll,
    add,
    addListItem,
    loadList,
    loadDetails,
    showDetails,
    showLoadingMessage,
    hideLoadingMessage,
  };
})();

pokemonRepository.loadList().then(function () {
  //data is loaded into pokemon pokemonList array
  pokemonRepository.getAll().forEach((pokemon) => {
    pokemonRepository.addListItem(pokemon);
  });
});

$(document).ready(function () {
  //live search
  $("#search-input").on("keyup", function () {
    var searchTerm = $(this).val().toLowerCase();
    $(".pokemon-list li").each(function () {
      if (
        $(this).filter("[data-search-term *= " + searchTerm + "]").length > 0 ||
        searchTerm.length < 1
      ) {
        $(this).show();
      } else {
        $(this).hide();
      }
    });
  });
});
