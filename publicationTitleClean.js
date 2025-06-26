(async () => {
    // ------------------- 调试信息说明 -------------------
    // 1. 打开调试输出窗口: Zotero 顶部菜单 -> 帮助 (Help) -> 调试输出日志记录 (Debug Output Logging) -> 查看输出 (View Output)
    // 2. 运行此脚本后，切换到该窗口查看详细日志。
    // ----------------------------------------------------

    Zotero.debug("---【期刊名修改脚本】开始运行---");
    alert("脚本已启动。请在“帮助 -> 调试输出日志记录 -> 查看输出”窗口中查看详细过程。");

    var zoteroPane = Zotero.getActiveZoteroPane();
    var items = zoteroPane.getSelectedItems();

    // 调试点 1: 检查获取到的条目数量
    Zotero.debug(`检测到选中的条目数量: ${items.length}`);

    if (items.length === 0) {
        Zotero.debug("-> 错误：没有选中任何条目，脚本终止。");
        return "错误：您没有选中任何文献条目。";
    }

    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var itemTitle = item.getField('title') || '[该条目无标题]';
        
        // 调试点 2: 正在处理哪个条目
        Zotero.debug(`\n[正在处理第 ${i + 1} 个条目: “${itemTitle}”]`);

        var originalJournal = item.getField("publicationTitle");

        // 调试点 3: 检查原始期刊名
        if (originalJournal) {
            Zotero.debug(`  - 原始期刊名是: "${originalJournal}"`);
            
            // 兼容英文半角 ":" 和中文全角 "："
            let separator = originalJournal.includes('：') ? '：' : ':';
            
            if (!originalJournal.includes(separator)) {
                 Zotero.debug("  - 期刊名中不含冒号，跳过此条目。");
                 continue; // 跳过当前循环，处理下一个
            }

            var newJournal = originalJournal.split(separator)[0].trim(); // trim() 用于删除可能存在的前后空格
            
            // 调试点 4: 检查处理后的新期刊名
            Zotero.debug(`  - 处理后的新期刊名是: "${newJournal}"`);

            item.setField("publicationTitle", newJournal);
        } else {
            Zotero.debug("  - 该条目没有“期刊名”(publicationTitle)字段，已跳过。");
        }
    }

    // 关键步骤：保存所有更改到数据库
    try {
        await Zotero.DB.executeTransaction(async () => {
            for(const item of items) {
                await item.save({ skipDateModifiedUpdate: true });
            }
        });
        // 调试点 5: 确认保存成功
        Zotero.debug("\n--- 所有更改已成功保存到数据库 ---");
    } catch (e) {
        Zotero.debug("--- 错误：保存更改时发生异常 ---");
        Zotero.debug(e);
        return "保存时出错，请查看调试输出获取详情。";
    }

    Zotero.debug("--- 脚本执行完毕 ---");
    return `操作完成！共处理了 ${items.length} 个条目。请刷新查看。`;
})()
