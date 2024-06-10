import { For, JSX, splitProps } from "solid-js";

interface TableProps extends JSX.HTMLAttributes<HTMLTableElement> {
  headers: any[];
  items?: any[];
}

export default function (props: TableProps) {
  const [_, otherProps] = splitProps(props, ["headers", "items"]);

  return (
    <div class="overflow-x-auto">
      <table
        class={"border-collapse w-full whitespace-nowrap " + otherProps.class}
      >
        <thead>
          <tr>
            <For each={props.headers}>
              {(item) => (
                <th class="text-left font-semibold border-t border-b border-gray-200 p-3">
                  {item}
                </th>
              )}
            </For>
          </tr>
        </thead>
        <tbody>
          <For
            each={props.items}
            fallback={
              <tr>
                <td
                  class="p-3.5 text-center border-t border-b border-gray-200"
                  colspan={props.headers.length}
                >
                  data tidak tersedia
                </td>
              </tr>
            }
          >
            {(items) => (
              <tr>
                <For each={items}>
                  {(item) => (
                    <td class="text-left border-t border-b border-gray-200 p-3.5">
                      {item}
                    </td>
                  )}
                </For>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </div>
  );
}
