export const processAnnouncementContent = () => {
  const contentDivs = document.querySelectorAll(".announcement-content");

  contentDivs.forEach((div) => {
    const images = div.querySelectorAll("img");
    images.forEach((img) => {
      if (!img.onclick) {
        img.onclick = () => {
          const modal = document.createElement("div");
          modal.className =
            "fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4";

          const imgContainer = document.createElement("div");
          imgContainer.className = "relative max-w-4xl max-h-[90vh]";

          const closeBtn = document.createElement("button");
          closeBtn.className =
            "absolute top-2 right-2 bg-white rounded-full p-1 text-gray-800 hover:bg-gray-200";
          closeBtn.innerHTML =
            '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>';

          const fullImg = document.createElement("img");
          fullImg.src = img.src;
          fullImg.alt = img.alt || "Image";
          fullImg.className = "max-w-full max-h-[85vh] object-contain";

          imgContainer.appendChild(closeBtn);
          imgContainer.appendChild(fullImg);
          modal.appendChild(imgContainer);

          document.body.appendChild(modal);

          modal.onclick = () => {
            document.body.removeChild(modal);
          };

          closeBtn.onclick = (e) => {
            e.stopPropagation();
            document.body.removeChild(modal);
          };

          fullImg.onclick = (e) => {
            e.stopPropagation();
          };
        };
      }
    });

    const links = div.querySelectorAll("a");
    links.forEach((link) => {
      const href = link.getAttribute("href") || "";
      const isDocument = /\.(pdf|doc|docx|ppt|pptx|xls|xlsx|txt)$/i.test(href);

      if (isDocument && !link.classList.contains("document-link")) {
        const extension = href.split(".").pop()?.toLowerCase();
        let icon = "📎";

        switch (extension) {
          case "pdf":
            icon = "📄";
            break;
          case "doc":
          case "docx":
            icon = "📝";
            break;
          case "ppt":
          case "pptx":
            icon = "📊";
            break;
          case "xls":
          case "xlsx":
            icon = "📈";
            break;
        }

        link.classList.add("document-link");

        if (!link.querySelector(".document-icon")) {
          const fileName = link.textContent || "Document";
          link.innerHTML = `<span class="document-icon">${icon}</span> ${fileName}`;
        }

        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noopener noreferrer");
      }
    });

    const tables = div.querySelectorAll("table");
    tables.forEach((table) => {
      if (!table.parentElement?.classList.contains("table-responsive")) {
        const wrapper = document.createElement("div");
        wrapper.className = "table-responsive";
        table.parentNode?.insertBefore(wrapper, table);
        wrapper.appendChild(table);
      }
    });

    const quillClasses = div.querySelectorAll(
      ".ql-align-center, .ql-align-right, .ql-align-justify"
    );
    quillClasses.forEach((element) => {
      if (element.classList.contains("ql-align-center")) {
        (element as HTMLElement).style.textAlign = "center";
      } else if (element.classList.contains("ql-align-right")) {
        (element as HTMLElement).style.textAlign = "right";
      } else if (element.classList.contains("ql-align-justify")) {
        (element as HTMLElement).style.textAlign = "justify";
      }
    });
  });
};
