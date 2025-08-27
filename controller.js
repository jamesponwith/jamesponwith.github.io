/**
 * controller.js — dependency-free controller for the portfolio site
 * - Replaces unused/broken jQuery plugin calls (singlePageNav, magnificPopup, counterUp, stellar)
 * - Fixes syntax error from anonymous `function(){}` block
 * - Adds robust mobile menu toggle, smooth-scrolling, active-link highlight
 * - Keeps working with Bulma classes used in the existing HTML
 */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    // ===== Mobile menu (Bulma) =====
    // Works with .nav-toggle (burger) and .nav-menu. Also supports Bulma's .navbar-burger/.navbar-menu if present.
    var burger = document.querySelector('.nav-toggle, .navbar-burger');
    var menu   = document.querySelector('.nav-menu, .navbar-menu');

    if (burger && menu) {
      var toggleMenu = function () {
        burger.classList.toggle('is-active');
        menu.classList.toggle('is-active');
      };
      burger.addEventListener('click', toggleMenu);

      // Close menu after clicking any nav item (useful on mobile)
      menu.addEventListener('click', function (e) {
        if (e.target.closest('.nav-item, .navbar-item')) {
          burger.classList.remove('is-active');
          menu.classList.remove('is-active');
        }
      });
    }

    // ===== Smooth scrolling for in-page anchors =====
    // Any nav item or link that points to #section-id
    var anchorLinks = document.querySelectorAll('.nav-item a[href^="#"], .navbar-item[href^="#"], a.button[href^="#"]');
    anchorLinks.forEach(function (link) {
      link.addEventListener('click', function (e) {
        var id = link.getAttribute('href');
        if (!id || id === '#') return;
        var target = document.querySelector(id);
        if (!target) return;

        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // Update URL hash without jumping
        if (history.pushState) history.pushState(null, '', id);
      });
    });

    // Support for the homepage "scroll down" dot button (.button-scroll data-scrollTo="about")
    var scrollButtons = document.querySelectorAll('.button-scroll[data-scrollTo]');
    scrollButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-scrollTo');
        if (!id) return;
        var target = document.getElementById(id) || document.querySelector('#' + id);
        if (!target) return;
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (history.pushState) history.pushState(null, '', '#' + id);
      });
    });

    // ===== Active section highlight (optional) =====
    // Adds 'is-active' to the nav link that matches the section in view.
    var sections = Array.from(document.querySelectorAll('section[id]'));
    if ('IntersectionObserver' in window && sections.length) {
      var linkMap = new Map();
      document.querySelectorAll('.nav-item a[href^="#"], .navbar-item[href^="#"]').forEach(function (link) {
        linkMap.set(link.getAttribute('href'), link);
      });

      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var id = '#' + entry.target.id;
            document.querySelectorAll('.nav-item a.is-active, .navbar-item.is-active').forEach(function (el) {
              el.classList.remove('is-active', 'active');
            });
            var link = linkMap.get(id);
            if (link) link.classList.add('is-active');
          }
        });
      }, { rootMargin: '0px 0px -70% 0px', threshold: 0 });

      sections.forEach(function (sec) { observer.observe(sec); });
    }

    // ===== Remove focus outline after mouse click (keeps it for keyboard users) =====
    // Small UX nicety
    document.body.addEventListener('mousedown', function () {
      document.body.classList.add('using-mouse');
    });
    document.body.addEventListener('keydown', function () {
      document.body.classList.remove('using-mouse');
    });
  });
})();
