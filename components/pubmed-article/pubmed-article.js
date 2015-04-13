Polymer({
  pmid: '',
  doi: '',
  showLinks: false,
  pmidChanged: function() {
    if (this.pmid) {
      PubMed.summary([this.pmid]).then(function(items) {
        this.article = items[0];
      }.bind(this));
    }
  },
  doiChanged: function() {
    if (this.doi) {
      PubMed.search(this.doi + '[DOI]').then(function(ids) {
        this.pmid = ids[0];
      }.bind(this));
    }
  }
});
