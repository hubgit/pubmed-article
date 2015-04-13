Polymer({
  pmid: '',
  doi: '',
  showLinks: false,
  sortByDate: function(a, b) {
    if (a.date === b.date) {
      return 0;
    }

    return (a.date < b.date) ? 1 : -1;
  },
  pmidChanged: function() {
    if (this.pmid) {
      this.summary([this.pmid]).then(function(items) {
        this.article = items[0];
      }.bind(this));

      if (this.showLinks) {
        this.links(this.pmid, 'pubmed_pubmed_refs').then(this.summary).then(function(items) {
          items.forEach(function(item) {
            item.date = item.pubdate || item.epubdate;
          });

          items.sort(this.sortByDate);

          this.references = items;
        }.bind(this));

        this.links(this.pmid, 'pubmed_pubmed_citedin').then(this.summary).then(function(items) {
          items.forEach(function(item) {
            item.date = item.pubdate || item.epubdate;
          });

          items.sort(this.sortByDate);

          this.citations = items;
        }.bind(this));
      }
    }
  },
  doiChanged: function() {
    if (this.doi) {
      this.search(this.doi + '[DOI]').then(function(ids) {
        this.pmid = ids[0];
      }.bind(this));
    }
  },
  search: function(term) {
    var resource = new Resource('http://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi', {
      db: 'pubmed',
      term: term,
      retmode: 'json'
    });

    return resource.get('json').then(function(response) {
      var result = response.esearchresult;

      if (!result.count) {
        return;
      }

      return result.idlist;
    }.bind(this));
  },
  summary: function(pmids) {
    var url = 'http://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi';

    var params = {
      db: 'pubmed',
      id: pmids.splice(0, 50).join(','),
      retmode: 'json',
    };

    var collection = new Collection(url, params);

    collection.items = function(response) {
      var result = response.result;

      return Object.keys(result).map(function(key) {
        return result[key];
      });
    };

    collection.next = function(response) {
      if (!pmids.length) {
        return;
      }

      params.id = pmids.splice(0, 50).join(',');

      return [url, params];
    };

    return collection.get('json');
  },
  links: function(pmid, linkname) {
    var params = {
      id: pmid,
      linkname: linkname,
      retmode: 'xml' // no JSON for ELink yet
    };

    var collection = new Collection('http://eutils.ncbi.nlm.nih.gov/entrez/eutils/elink.fcgi', params);

    collection.items = function(response) {
      var nodes = response.querySelectorAll('LinkSet > LinkSetDb > Link > Id');

      return Array.prototype.map.call(nodes, function(node) {
        return node.textContent;
      });
    }.bind(this);

    collection.next = function(response) {
      return null; // no pagination for ELink yet
    }

    return collection.get('document');
  }
});
