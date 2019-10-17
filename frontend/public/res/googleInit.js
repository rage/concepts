// The main code might not have loaded, so we have this wrapper instead
window._concepts_google_init_wrapper = () => {
  if (!window._concepts_google_init) {
    window.google_inited = true
  } else {
    window._concepts_google_init()
  }
}
