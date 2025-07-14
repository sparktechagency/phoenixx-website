// 'use client'

// import 'froala-editor/css/froala_editor.pkgd.min.css';
// import 'froala-editor/css/froala_style.min.css';
// import 'froala-editor/css/plugins/emoticons.min.css';
// import 'froala-editor/js/froala_editor.pkgd.min.js';

// import 'froala-editor/js/plugins/emoticons.min.js';
// import 'froala-editor/js/plugins/lists.min.js';
// import FroalaEditor from 'react-froala-wysiwyg';

// const Page = () => {

//   const config = {
//     placeholderText: 'Write your post description here...',
//     heightMin: 300,
//     toolbarButtons: ['bold', 'italic', 'underline', 'formatOL', 'formatUL', 'insertImage',],
//     pluginsEnabled: ['lists', 'emoticons', 'image'],
//     quickInsertTags: [],
//     listAdvancedTypes: false,
//     toolbarInline: false,
//     charCounterCount: false,
//     events: {
//       'initialized': function () {
//         console.log('Editor initialized');
//         // Remove dropdown functionality and arrows
//         const editor = this;

//         // Force show list buttons
//         setTimeout(() => {
//           editor.$tb.find('.fr-command[data-cmd="formatOL"]').show();
//           editor.$tb.find('.fr-command[data-cmd="formatUL"]').show();

//           // Remove dropdown arrows
//           editor.$tb.find('.fr-command[data-cmd="formatOL"]').removeClass('fr-dropdown');
//           editor.$tb.find('.fr-command[data-cmd="formatUL"]').removeClass('fr-dropdown');
//         }, 100);
//       }
//     }
//   };

//   return (
//     <div className="container mx-auto">
//       <style jsx global>{`
//         /* Hide dropdown arrows */
//         .fr-command[data-cmd="formatOL"]:after,
//         .fr-command[data-cmd="formatUL"]:after {
//           display: none !important;
//         }

//         /* Hide all dropdown menus */
//         .fr-dropdown-menu {
//           display: none !important;
//         }

//         /* Make sure list buttons are visible */
//         .fr-command[data-cmd="formatOL"],
//         .fr-command[data-cmd="formatUL"] {
//           display: inline-block !important;
//           visibility: visible !important;
//         }

//         /* Basic list styling */
//         .fr-element ol {
//           list-style-type: decimal !important;
//         }

//         .fr-element ul {
//           list-style-type: disc !important;
//         }
//       `}</style>
//       <FroalaEditor config={config} />
//     </div>
//   );
// };

// export default Page;




const page = () => {
  return (
    <div>
      This is pronab
    </div>
  );
};

export default page;

