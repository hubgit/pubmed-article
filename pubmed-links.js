Polymer({
  pmid: '',
  pmidChanged: function() {
    if (this.pmid) {
      PubMed.links(this.pmid, this.linkname).then(PubMed.summary).then(function(items) {
        items.forEach(function(item) {
          item.date = item.pubdate || item.epubdate;
        });

        items.sort(function(a, b) {
          if (a.date === b.date) {
            return 0;
          }

          return (a.date < b.date) ? 1 : -1;
        });

        this.items = items;
      }.bind(this));
    }
  }
});
