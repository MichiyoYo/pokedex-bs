// IIFE function to make the data structure private.
// It returns an object which contains references to the functions to manipulate the data structure.
// The data structure remains "private" i.e. not directly accessible from the global environment.
let pokemonRepository = (function () {
  let pokemonList = [];
  const apiUrl = "https://pokeapi.co/api/v2/pokemon/?limit=150";
  const modalContainer = $("#modal-container");

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

  //searchPokemon filters the pokemonList, searching by name
  function searchPokemon(nameToSearch) {
    return pokemonList.filter((pokemon) => pokemon.name.includes(nameToSearch));
  }

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

  //event handler function that prints the clicked pokemon's name to the console
  //the pokemon argument is actually the event object
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
      loadingMessageArea.append(message);
    }
  }

  function hideLoadingMessage() {
    const loadingMessageArea = document.querySelector(".loading-message-area");
    if (!loadingMessageArea.classList.contains("hide")) {
      loadingMessageArea.classList.add("hide");
      //remove the message
      let message = document.querySelector(".loading-msg");
      loadingMessageArea.removeChild(message);
    }
  }

  function populateModal(pokemonToShow) {
    //populating name
    let pokemonName = $("#pokemon-title");
    pokemonName.text(pokemonToShow.name);

    //populating types
    let pokemonTypes = $(".type-list");
    //remove previous types if any
    pokemonTypes.text("");
    pokemonToShow.types.forEach((type) => {
      console.log(type.type.name);
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
      console.log(ability.ability.name);
      let abilityItem = $(`<li>${ability.ability.name}</li>`);
      abilityList.append(abilityItem);
    });
  }

  //event listeners

  //addEvent takes care of binding the click event with the event handler
  function showOnClick(button, pokemon) {
    button.on("click", function (event) {
      showDetails(pokemon);
    });
  }

  return {
    getAll,
    add,
    searchPokemon,
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
